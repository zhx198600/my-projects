'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/lib/routing';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push('/orders');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
