'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !stored) {
      router.replace('/login');
    }
  }, [token, router]);

  const stored = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
  if (!token && !stored) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500">Redirigiendo...</p>
      </div>
    );
  }

  return <>{children}</>;
}
