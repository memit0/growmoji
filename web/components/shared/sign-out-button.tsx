'use client';

import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-2" 
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
} 