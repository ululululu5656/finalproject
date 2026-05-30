'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    login(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Coffee className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CafeFlow</h1>
          <p className="text-center text-muted-foreground">
            Cafe Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Select your role to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-4 p-4"
              onClick={() => handleLogin('admin')}
              disabled={isLoading}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Admin Login</span>
                <span className="text-sm text-muted-foreground">
                  Full access to all features
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-4 p-4"
              onClick={() => handleLogin('staff')}
              disabled={isLoading}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <User className="h-6 w-6 text-chart-3" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Staff Login</span>
                <span className="text-sm text-muted-foreground">
                  Access orders and billing
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Demo application for cafe management
        </p>
      </div>
    </div>
  );
}
