import { PremiumGuard } from '@/components/app/PremiumGuard';
import { ResponsiveLayout } from '@/components/app/ResponsiveLayout';
import { getCurrentUser, requireAuth } from '@/lib/auth';

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
      <ResponsiveLayout user={user}>
        {children}
      </ResponsiveLayout>
    </PremiumGuard>
  );
} 