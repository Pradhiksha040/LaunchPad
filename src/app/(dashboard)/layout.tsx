import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { LaunchPadAssistantWidget } from '@/components/chat/LaunchPadAssistantWidget';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F3F9F5] overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {children}
          </main>
        </div>
        <LaunchPadAssistantWidget />
      </div>
    </AuthGuard>
  );
}
