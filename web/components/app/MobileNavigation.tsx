'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Menu,
    User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface MobileNavigationProps {
    navigation: NavigationItem[];
    userEmail?: string;
}

export function MobileNavigation({ navigation, userEmail }: MobileNavigationProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
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
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
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
                                    {userEmail || 'User'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
