'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { useAuthStore } from '@/lib/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      
      {/* Main content */}
      <div className="md:pl-64">
        <AppHeader title={title} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
