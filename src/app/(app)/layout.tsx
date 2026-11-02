import { Shell } from '@/components/shell';
import { loadWorkspace } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await loadWorkspace();
  return (
    <Shell name={profile.display_name} theme={profile.theme}>
      {children}
    </Shell>
  );
}
