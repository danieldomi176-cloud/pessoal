import { loadWorkspace } from '@/lib/data';
import { signOut } from '@/app/actions';
import { PageHeading, Card } from '@/components/ui';
import { ActionForm } from '@/components/form';
import { CardOrder } from '@/components/interactive';
import { Icon } from '@/components/icon';
export default async function ProfilePage() {
  const d = await loadWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="O MEU PERFIL · À MINHA MANEIRA"
        title="Um espaço que se adapta a ti."
        text="As tuas preferências, os teus dados, o teu ritmo."
      />
      <div className="two-columns">
        <div className="stack">
          <Card title="O meu espaço" icon="user">
            <div className="profile-details">
              <span className="avatar">
                {(d.profile.display_name || 'L').slice(0, 1).toUpperCase()}
              </span>
              <div>
                <h3>{d.profile.display_name || 'O teu espaço'}</h3>
                <p>{d.email}</p>
              </div>
            </div>
            <ActionForm action="profile.save" className="stack">
              <label>
                Como queres que te chamemos?
                <input
                  name="display_name"
                  defaultValue={d.profile.display_name}
                  maxLength={60}
                  placeholder="O teu primeiro nome"
                />
              </label>
              <div className="form-row">
                <label>
                  Aparência
                  <select name="theme" defaultValue={d.profile.theme}>
                    <option value="dark">Escuro · padrão</option>
                    <option value="light">Claro</option>
                  </select>
                </label>
                <label>
                  Meta de leitura (minutos por dia)
                  <input
                    name="daily_reading_minutes"
                    type="number"
                    min={1}
                    max={180}
                    defaultValue={d.profile.daily_reading_minutes}
                    required
                  />
                </label>
              </div>
              <label className="checkbox-label">
                <input
                  name="spiritual_reflection"
                  type="checkbox"
                  defaultChecked={d.profile.spiritual_reflection}
                />
                Mostrar reflexão espiritual no início
              </label>
              <div>
                <h3>Os cartões do teu início</h3>
                <p className="policy-note" style={{ margin: '8px 0 14px' }}>
                  Escolhe quais aparecem e usa as setas para mudar a ordem.
                </p>
                <CardOrder current={d.profile.dashboard_cards} />
              </div>
              <button className="button primary">Guardar as minhas preferências</button>
            </ActionForm>
          </Card>
          <Card title="Os meus dados" icon="shield">
            <p className="content-prose">
              Podes descarregar os teus registos em JSON. O ficheiro inclui informação pessoal:
              guarda-o num local seguro. A exportação e a eliminação são registadas no histórico de
              operações sensíveis.
            </p>
            <a className="button secondary" href="/api/export" style={{ marginTop: 20 }}>
              <Icon name="download" size={16} />
              Exportar os meus dados
            </a>
            <details className="disclosure">
              <summary>Eliminar os meus dados pessoais</summary>
              <p className="content-prose" style={{ marginBottom: 20 }}>
                Apaga tarefas, hábitos, livros, sessões, reflexões, progresso de inglês e
                preferências. É irreversível. A conta de acesso e o email no Supabase Auth continuam
                ativos; a eliminação da identidade requer o administrador do projeto. Não elimina
                ficheiros exportados nem backups do fornecedor.
              </p>
              <ActionForm
                action="profile.erase"
                className="stack"
                confirm="Confirmas a eliminação permanente de todos os teus registos pessoais nesta instância?"
              >
                <label>
                  Escreve APAGAR para confirmar
                  <input
                    name="confirmation"
                    required
                    pattern="APAGAR"
                    autoComplete="off"
                    placeholder="APAGAR"
                  />
                </label>
                <button className="button danger">
                  <Icon name="trash" size={16} />
                  Eliminar os dados pessoais
                </button>
              </ActionForm>
            </details>
          </Card>
        </div>
        <aside className="stack">
          <Card title="Privado por natureza" icon="lock">
            <ul className="privacy-list">
              <li>Os teus dados pertencem à tua conta, com regras de acesso na base de dados.</li>
              <li>Sem publicidade, analytics ou APIs de IA generativa.</li>
              <li>O áudio é opcional e pode usar serviços do fabricante do navegador.</li>
              <li>Idioma: português. Moeda de referência: MZN. Fuso horário: Africa/Maputo.</li>
              <li>A aplicação não faz diagnósticos nem mede fé ou valor pessoal.</li>
            </ul>
          </Card>
          <form action={signOut}>
            <button className="button secondary full">
              <Icon name="logout" size={16} />
              Terminar esta sessão
            </button>
          </form>
          <Card title="Lembretes & notificações" icon="moon">
            <p className="content-prose">
              Ainda não há notificações automáticas ou push nesta versão. Não pedimos permissões ao
              navegador. A rotina e os lembretes em segundo plano estão planeados para uma fase
              posterior.
            </p>
          </Card>
          <div className="gentle-note">
            <Icon name="leaf" />
            <h3>As tuas escolhas podem mudar.</h3>
            <p>
              Podes reduzir as metas, ocultar cartões e voltar a começar. O LifeOS deve caber na tua
              vida.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
