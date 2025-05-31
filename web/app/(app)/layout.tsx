import { PremiumGuard } from '@/components/app/PremiumGuard';
import { UserSubscriptionStatus } from '@/components/app/UserSubscriptionStatus';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { Button } from '@/components/ui/button';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import {
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  Target,
  Timer,
  User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication - will redirect if not signed in
  await requireAuth();
  const user = await getCurrentUser();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Habits', href: '/habits', icon: Target },
    { name: 'Statistics', href: '/stats', icon: BarChart3 },
    { name: 'Todos', href: '/todos', icon: CheckSquare },
    { name: 'Timer', href: '/timer', icon: Timer },
  ];

  return (
    <PremiumGuard>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 p-6 border-b">
              <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Growmoji Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl">Growmoji</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user?.email || 'User'}
                  </div>
                  <UserSubscriptionStatus />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  Sync with Mobile
                </Button>
                <SignOutButton />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </PremiumGuard>
  );
} 