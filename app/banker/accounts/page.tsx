'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BankerAccountsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to banker dashboard
    router.replace('/banker/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}
