import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
const email = `e2e-${randomBytes(6).toString('hex')}@example.com`;
const password = randomBytes(24).toString('base64url');
let page: Page, context: BrowserContext;
const errors: string[] = [];
test.describe.serial('LifeOS com Supabase real', () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
    page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
  });
  test.afterAll(async () => {
    await context?.close();
    const dburl = process.env.TEST_DATABASE_URL;
    if (!dburl || !['localhost', '127.0.0.1'].includes(new URL(dburl).hostname))
      throw new Error('Cleanup só permitido em DB local.');
    const pg = new Client({ connectionString: dburl });
    await pg.connect();
    await pg.query('delete from auth.users where email=$1', [email]);
    await pg.end();
  });
  test('protege rotas e cria uma conta real com dashboard vazio', async () => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole('link', { name: /Começar a minha jornada/ }).click();
    await page.getByLabel('Como te chamas?').fill('Daniel');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Palavra-passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Criar o meu espaço' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Daniel/ })).toBeVisible();
    await expect(page.getByText('Um dia com espaço para o essencial')).toBeVisible();
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  });
  test('cria, edita e conclui uma tarefa; mantém a conclusão após recarga', async () => {
    await page.goto('/today');
    const create = page.locator('#new-task');
    await create.getByLabel('Qual é o próximo passo?').fill('Preparar o meu primeiro passo');
    await create.getByLabel('Prioridade').selectOption('3');
    await create.getByRole('button', { name: 'Adicionar tarefa' }).click();
    await expect(
      page.locator('.task-title', { hasText: 'Preparar o meu primeiro passo' }),
    ).toBeVisible();
    await page.getByLabel('Opções de Preparar o meu primeiro passo').click();
    const edit = page.locator('.edit-popover');
    await edit.getByLabel('Qual é o próximo passo?').fill('Preparar o dia de amanhã');
    await edit.getByRole('button', { name: 'Guardar alterações' }).click();
    await expect(page.getByLabel('Concluir Preparar o dia de amanhã')).toBeVisible();
    await page.getByLabel('Concluir Preparar o dia de amanhã').click();
    await expect(page.getByText('Ver 1 tarefa(s) concluída(s)', { exact: true })).toBeVisible();
    await page.reload();
    await page.getByText('Ver 1 tarefa(s) concluída(s)', { exact: true }).click();
    await expect(page.getByLabel('Reabrir Preparar o dia de amanhã')).toBeVisible();
  });
  test('regista um hábito apenas no dia atual e permite desmarcar', async () => {
    await page.getByText('Criar um hábito', { exact: true }).click();
    await page.getByLabel('O meu hábito', { exact: true }).fill('Reservar um momento para Deus');
    await page.getByRole('button', { name: 'Criar hábito', exact: true }).click();
    await page.getByLabel('Registar Reservar um momento para Deus', { exact: true }).click();
    await expect(
      page.getByLabel('Desmarcar Reservar um momento para Deus', { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByLabel('Desmarcar Reservar um momento para Deus', { exact: true }),
    ).toBeVisible();
  });
  test('leitura guarda páginas, reflexão e livro atual', async () => {
    await page.goto('/reading');
    await page.getByLabel('Título', { exact: true }).fill('A minha leitura de teste');
    await page.getByLabel('Autor (opcional)').fill('Autor de teste');
    await page.getByLabel('Total de páginas').fill('100');
    await page.getByRole('button', { name: 'Adicionar livro', exact: true }).click();
    await page.getByRole('button', { name: 'Definir como atual', exact: true }).click();
    await expect(page.getByText('A MINHA LEITURA ATUAL', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Começar a ler', exact: true }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await page.getByLabel('Em que página ficaste?').fill('5');
    await page
      .getByLabel('O que aprendeste? Qual foi a ideia mais importante? Como a podes aplicar?')
      .fill('Posso começar por uma ação pequena e concreta.');
    await page.getByRole('button', { name: 'Guardar a minha leitura' }).click();
    await expect(page.getByText('5 de 100 páginas', { exact: true })).toBeVisible();
    await page.reload();
    await expect(
      page.getByText('Posso começar por uma ação pequena e concreta.', { exact: true }),
    ).toBeVisible();
  });
  test('foco oferece ajuda específica e guarda uma sessão medida', async () => {
    await page.goto('/focus');
    await page.getByLabel('O que vais fazer nestes minutos?').fill('Escrever uma primeira frase');
    await page
      .getByLabel('O que está a dificultar o primeiro passo?')
      .selectOption('Medo de errar');
    await expect(
      page.getByText('O primeiro rascunho pode ser imperfeito.', { exact: false }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Iniciar o meu bloco de foco' }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await expect.poll(async () => page.getByRole('timer').textContent()).not.toBe('05:00');
    await page.getByRole('button', { name: 'Terminar e guardar sessão' }).click();
    await expect(page.getByText('O que vais fazer nestes minutos?', { exact: true })).toBeVisible();
    await expect(page.getByText('Escrever uma primeira frase', { exact: true })).toBeVisible();
  });
  test('aula A0 corrige erros, guarda tentativa, agenda revisão e permite melhorar', async () => {
    await page.goto('/english/hello');
    await page.getByLabel('Hello', { exact: true }).check();
    await page.getByLabel('Good morning', { exact: true }).check();
    await page.getByRole('textbox', { name: 'Resposta ao exercício 3' }).fill('wrong');
    await page.getByRole('textbox', { name: 'Resposta ao exercício 4' }).fill('How are you?');
    await page.getByRole('button', { name: 'Corrigir e guardar a minha tentativa' }).click();
    await expect(page.getByText(/3 de 4 respostas corretas/)).toBeVisible();
    await expect(page.getByText(/Resposta: Goodbye/)).toBeVisible();
    await page.getByRole('textbox', { name: 'Resposta ao exercício 3' }).fill('Goodbye');
    await page.getByRole('button', { name: 'Corrigir e guardar a minha tentativa' }).click();
    await expect(page.getByText(/4 de 4 respostas corretas/)).toBeVisible();
    await page.goto('/english');
    await expect(page.getByText('Melhor tentativa: 100%', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Revisão espaçada' })).toBeVisible();
    const review = page
      .locator('.review-card')
      .filter({ has: page.getByLabel('Olá', { exact: true }) });
    await review.getByRole('textbox').fill('Hello');
    await review.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Correto! Próxima revisão agendada.')).toBeVisible();
  });
  test('LifeAI usa contagens reais e declara módulos ainda planeados', async () => {
    await page.goto('/lifeai');
    await page.getByRole('button', { name: 'Organiza o meu dia', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('0 tarefa(s) pendente(s) e 1 hábito(s)');
    await page.getByLabel('Comando para o LifeAI').fill('Quanto dinheiro gastei?');
    await page.getByRole('button', { name: 'Enviar comando' }).click();
    await expect(page.getByRole('status')).toContainText('ainda não está implementado');
  });
  test('personaliza cartões e tema, exporta apenas os seus dados', async () => {
    await page.goto('/profile');
    await page.getByLabel('Aparência').selectOption('light');
    await page.getByLabel('Leitura', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Guardar as minhas preferências' }).click();
    await expect(page.locator('.app')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('.app')).toHaveAttribute('data-theme', 'light');
    const response = await page.request.get('/api/export');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.email).toBe(email);
    expect(json.books).toHaveLength(1);
    expect(json.tasks).toHaveLength(1);
    expect(json.attempts).toHaveLength(2);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.getByLabel('Aparência').selectOption('dark');
    await page.getByLabel('Leitura', { exact: true }).check();
    await page.getByRole('button', { name: 'Guardar as minhas preferências' }).click();
    await expect(page.locator('.app')).toHaveAttribute('data-theme', 'dark');
  });
  test('dashboard e navegação móvel são acessíveis e não têm overflow', async () => {
    await page.goto('/');
    await page.screenshot({ path: '/workspace/artifacts/lifeos-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('navigation', { name: 'Navegação móvel' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.screenshot({ path: '/workspace/artifacts/lifeos-mobile.png', fullPage: true });
    await page
      .getByRole('navigation', { name: 'Navegação móvel' })
      .getByRole('link', { name: 'Hoje', exact: true })
      .click();
    await expect(page).toHaveURL('/today');
    expect(errors).toEqual([]);
  });
  test('eliminação exige confirmação e remove dados pessoais; terminar sessão protege rotas', async () => {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto('/profile');
    await page.getByText('Eliminar os meus dados pessoais', { exact: true }).click();
    await page.getByLabel('Escreve APAGAR para confirmar').fill('APAGAR');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Eliminar os dados pessoais', exact: true }).click();
    await expect(
      page.getByText('Dados pessoais eliminados. A conta de acesso continua ativa.'),
    ).toBeVisible();
    const r = await page.request.get('/api/export');
    const json = await r.json();
    expect(json.tasks).toHaveLength(0);
    expect(json.books).toHaveLength(0);
    expect(json.attempts).toHaveLength(0);
    await page.getByRole('button', { name: 'Terminar sessão', exact: true }).click();
    await expect(page).toHaveURL('/login');
    await page.goto('/today');
    await expect(page).toHaveURL('/login');
  });
});
