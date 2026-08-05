import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LaunchPad OS — Enterprise White-Label Business Platform',
  description: 'Production-ready business application platform supporting Standalone Mode and Integration Hub Mode for SAP, Oracle, Salesforce & REST APIs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F4EF] text-[#2F241F] selection:bg-[#A67C52] selection:text-white">
        {children}
      </body>
    </html>
  );
}
