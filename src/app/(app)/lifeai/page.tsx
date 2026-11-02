import { loadWorkspace } from '@/lib/data';
import { LifeAI } from '@/components/interactive';
export default async function Assistant() {
  const d = await loadWorkspace();
  return (
    <LifeAI
      pending={d.tasks.filter((t) => !t.completed_at).length}
      habits={d.habits.length}
      finished={d.tasks.filter((t) => t.completed_at).length}
    />
  );
}
