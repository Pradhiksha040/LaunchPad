'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alexander@launchpad-os.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setErrorMsg(null);

    try {
      await authService.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F3F9F5] text-[#173C2D] flex items-center justify-center p-6 selection:bg-[#DDEEDF]">
      <div className="bg-white border border-[#E2ECE5] rounded-3xl max-w-md w-full p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3F7659] text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-md">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D]">Sign in to LaunchPad OS</h1>
          <p className="text-xs text-[#5A7165]">Enterprise Reusable Application Platform Control Center</p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-3 bg-[#F3F9F5] rounded-xl border border-[#DDEEDF] text-xs space-y-2">
          <span className="font-bold text-[#3F7659] flex items-center gap-1">
            <Sparkles size={13} /> Quick Demo One-Click Sign-in:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('alexander@launchpad-os.com')}
              className="px-2.5 py-1 bg-white hover:bg-[#DDEEDF] text-[#173C2D] font-semibold text-[10px] rounded border border-[#E2ECE5]"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('elena.rostova@techsolutions.io')}
              className="px-2.5 py-1 bg-white hover:bg-[#DDEEDF] text-[#173C2D] font-semibold text-[10px] rounded border border-[#E2ECE5]"
            >
              Org Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('marcus.c@devhub.org')}
              className="px-2.5 py-1 bg-white hover:bg-[#DDEEDF] text-[#173C2D] font-semibold text-[10px] rounded border border-[#E2ECE5]"
            >
              Developer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="font-bold text-[#173C2D]">Work Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#173C2D]">Password</label>
              <a href="#" className="text-[11px] font-semibold text-[#3F7659] hover:underline">Forgot password?</a>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loggingIn ? 'Authenticating...' : 'Sign In to Control Center'} <ArrowRight size={15} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#5A7165]">
          Need an enterprise sandbox workspace?{' '}
          <Link href="/applications/create" className="font-bold text-[#3F7659] hover:underline">
            Create Application
          </Link>
        </div>
      </div>
    </div>
  );
}
