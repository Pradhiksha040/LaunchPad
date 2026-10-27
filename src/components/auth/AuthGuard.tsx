'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApiClient } from '@/lib/api/client';
import { authService } from '@/services/authService';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      // 1. Check local token presence
      const hasToken = ApiClient.isAuthenticated();
      const localUser = authService.getCurrentUserFromStorage();

      if (!hasToken || !localUser) {
        if (isMounted) {
          setAuthorized(false);
          setChecking(false);
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      // 2. Verify token validity with backend
      try {
        const verifiedUser = await authService.getMe();
        if (!verifiedUser && isMounted) {
          ApiClient.clearTokens();
          setAuthorized(false);
          setChecking(false);
          router.replace('/login?session_expired=true');
          return;
        }

        if (isMounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch (err: any) {
        if (isMounted) {
          // If 401 or unauthorized, redirect
          if (err.statusCode === 401) {
            ApiClient.clearTokens();
            router.replace('/login?session_expired=true');
          } else {
            // In case of transient network disruption, allow storage-backed user
            setAuthorized(true);
          }
          setChecking(false);
        }
      }
    }

    verifyAuth();

    // 3. Listen for session expiry event
    const handleAuthExpired = () => {
      if (isMounted) {
        setAuthorized(false);
        router.replace('/login?session_expired=true');
      }
    };

    window.addEventListener('launchpad:auth:expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('launchpad:auth:expired', handleAuthExpired);
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F3F9F5] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#3F7659] text-white flex items-center justify-center font-extrabold text-xl shadow-md animate-pulse">
          L
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#173C2D]">
          <Loader2 size={16} className="animate-spin text-[#3F7659]" />
          Verifying enterprise session & permissions...
        </div>
        <p className="text-[11px] text-[#5A7165]">LaunchPad Enterprise Control Center</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
