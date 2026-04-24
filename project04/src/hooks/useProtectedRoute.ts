'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from '@/lib/routing';

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const segments = pathname.split('/').filter(Boolean);
      const locale = segments[0] || 'zh';
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  return { isLoading };
}
