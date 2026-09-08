import type { Metadata } from 'next';
import '../styles/globals.css';
import { BrandingProvider } from '@/context/BrandingContext';

export const metadata: Metadata = {
  title: 'LaunchPad OS — Reusable Application Platform',
  description: 'Enterprise reusable application development and deployment platform. Standalone & Integration Hub operational engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#DDEEDF] selection:text-[#173C2D]">
        <BrandingProvider>{children}</BrandingProvider>
      </body>
    </html>
  );
}
