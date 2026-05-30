'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { useAuthStore } from '@/lib/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  /** Restrict the page to admins; staff are redirected to the dashboard. */
  requireAdmin?: boolean;
}

export function DashboardLayout({ children, title, requireAdmin = false }: DashboardLayoutProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  // Resolve the session from the cookie once on mount.
  useEffect(() => {
    if (status === 'idle') fetchMe();
  }, [status, fetchMe]);

  // Redirect unauthenticated users to the login screen.
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Keep staff out of admin-only pages.
  useEffect(() => {
    if (status === 'authenticated' && requireAdmin && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [status, requireAdmin, user, router]);

  if (status !== 'authenticated' || !user || (requireAdmin && user.role !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
