'use client';

import { MobileNavigation } from '@/components/app/MobileNavigation';
import { UserSubscriptionStatus } from '@/components/app/UserSubscriptionStatus';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { Button } from '@/components/ui/button';
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
import { usePathname } from 'next/navigation';

// Define User interface to avoid 'any'
interface User {
    email?: string;
}

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    user: User; // Changed from 'any'
}

export function ResponsiveLayout({ children, user }: ResponsiveLayoutProps) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Habits', href: '/habits', icon: Target },
        { name: 'Statistics', href: '/stats', icon: BarChart3 },
        { name: 'Todos', href: '/todos', icon: CheckSquare },
        { name: 'Timer', href: '/timer', icon: Timer },
    ];

    // Get page title based on current path
    const getPageTitle = () => {
        const currentNav = navigation.find(nav => nav.href === pathname);
        return currentNav?.name || 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:border-slate-200 md:flex md:flex-col">
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
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className="w-full justify-start gap-3 h-12"
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
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

            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MobileNavigation
                            navigation={navigation}
                            userEmail={user?.email}
                        />
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg overflow-hidden flex items-center justify-center">
                                <Image
                                    src="/icon.png"
                                    alt="Growmoji Logo"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold text-lg">Growmoji</span>
                        </div>
                    </div>
                    <SignOutButton />
                </div>
            </div>

            {/* Main Content */}
            <div className="md:pl-64">
                {/* Desktop Header */}
                <header className="hidden md:block bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">{getPageTitle()}</h1>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" className="hidden lg:flex">
                                Sync with Mobile
                            </Button>
                            <SignOutButton />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
