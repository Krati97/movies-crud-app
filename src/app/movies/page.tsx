'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth';
import { auth } from '@/services/firebase';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

export default function MoviesPage() {
  const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(auth, user => {
        if (!user) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await logout();

    router.push('/login');
  };

   if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Movies
        </h1>

        <Button onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="mt-10">
        <p>
          Movies CRUD page coming next...
        </p>
      </div>
    </div>
  );
}