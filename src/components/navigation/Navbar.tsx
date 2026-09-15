'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  User as UserIcon,
  Plus,
  Network,
  Server,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Command
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/mock/data';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    MOCK_NOTIFICATIONS.filter((n) => !n.read).length
  );

  useEffect(() => {
    async function loadUser() {
      const u = await authService.getMe();
      if (u) setUser(u);
    }
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AV';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-[#E2ECE5] shadow-2xs">
      {/* Left: Quick Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={16} />
          <input
            type="text"
            placeholder="Search applications, connectors, templates, audit logs... (Ctrl+K)"
            className="w-full pl-9 pr-12 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] placeholder-[#5A7165] focus:outline-none focus:border-[#3F7659] focus:bg-white transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-[#5A7165] bg-white px-1.5 py-0.5 rounded border border-[#E2ECE5]">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Dual Mode Indicator Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F9F5] border border-[#DDEEDF]">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#173C2D]">
            <Server size={13} className="text-[#3F7659]" /> Standalone
          </span>
          <span className="text-[#5A7165] text-[10px]">•</span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#173C2D]">
            <Network size={13} className="text-[#3F7659]" /> Hub Active
          </span>
        </div>

        {/* Create Application CTA */}
        <Link
          href="/applications/create"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Create App</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 text-[#173C2D] hover:bg-[#F3F9F5] rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3F7659] ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2ECE5] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#E2ECE5]">
                <h4 className="text-xs font-bold text-[#173C2D]">Notifications</h4>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] font-medium text-[#3F7659] hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#F3F9F5]">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#F3F9F5] transition-colors">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-[#173C2D]">{n.title}</span>
                      <span className="text-[10px] text-[#5A7165]">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#5A7165] mt-0.5 leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-[#F3F9F5] rounded-lg transition-colors border border-transparent hover:border-[#DDEEDF]"
          >
            <div className="w-8 h-8 rounded-full bg-[#DDEEDF] text-[#173C2D] flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#173C2D] leading-tight">
                {user?.name || 'Alexander Vance'}
              </span>
              <span className="text-[10px] font-medium text-[#5A7165]">
                {user?.role || 'Super Admin'}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#5A7165]" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2ECE5] rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-[#E2ECE5]">
                <p className="text-xs font-bold text-[#173C2D]">{user?.name || 'Alexander Vance'}</p>
                <p className="text-[11px] text-[#5A7165]">{user?.email || 'alexander@launchpad-os.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-[#DDEEDF] text-[#173C2D] rounded">
                  {user?.organization || 'TechSolutions Inc.'}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#173C2D] hover:bg-[#F3F9F5]"
                >
                  <UserIcon size={14} /> Account Settings
                </Link>
              </div>

              <div className="border-t border-[#E2ECE5] pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
