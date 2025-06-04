import { PremiumGuard } from '@/components/app/PremiumGuard';
import { ResponsiveLayout } from '@/components/app/ResponsiveLayout';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication - will redirect if not signed in
  await requireAuth();
  const user = await getCurrentUser();

  return (
    <PremiumGuard>
      <ResponsiveLayout user={user as User}>
        {children}
      </ResponsiveLayout>
    </PremiumGuard>
  );
} 