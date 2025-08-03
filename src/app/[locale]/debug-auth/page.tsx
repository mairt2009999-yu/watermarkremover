'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check session
    authClient.getSession().then((data) => {
      setSession(data);
      setLoading(false);
    });

    // Check cookies
    setCookies(document.cookie);
  }, []);

  const handleTestLogin = async () => {
    try {
      const result = await authClient.signIn.email({
        email: 'test@example.com', // Replace with a test email
        password: 'password123', // Replace with test password
        callbackURL: '/dashboard',
      });
      console.log('Login result:', result);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
          {cookies.split('; ').join('\n')}
        </pre>
        <p className="mt-2 text-sm text-gray-600">
          Looking for: better-auth.session_token
        </p>
        <p className="text-sm text-red-600">
          {cookies.includes('better-auth.session_token')
            ? '✅ Session cookie found'
            : '❌ Session cookie NOT found - This is the problem!'}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <p>NODE_ENV: {process.env.NODE_ENV}</p>
        <p>Base URL: {process.env.NEXT_PUBLIC_BASE_URL}</p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleTestLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Login
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
