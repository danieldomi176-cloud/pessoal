import { requireUser } from '@/lib/supabase/server';
import { loadWorkspace } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { db, user } = await requireUser();
  const data = await loadWorkspace();
  const { error } = await db.from('audit_events').insert({ user_id: user.id, action: 'export' });
  if (error)
    return Response.json(
      { error: 'Não foi possível registar a exportação. Tenta novamente.' },
      { status: 503 },
    );
  const audit: unknown[] = [];
  for (let page = 0; ; page++) {
    const result = await db
      .from('audit_events')
      .select('id,action,created_at')
      .eq('user_id', user.id)
      .order('created_at')
      .order('id')
      .range(page * 500, page * 500 + 499);
    if (result.error)
      return Response.json({ error: 'Não foi possível exportar o histórico.' }, { status: 503 });
    audit.push(...result.data);
    if (result.data.length < 500) break;
  }
  return new Response(
    JSON.stringify(
      { schema_version: 1, exported_at: new Date().toISOString(), ...data, audit_events: audit },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="lifeos-export.json"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
