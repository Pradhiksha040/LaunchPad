import Link from 'next/link';
import { Boxes, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F9F5] text-[#173C2D] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#3F7659] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
        L
      </div>
      <h1 className="text-3xl font-extrabold">404 — Page Not Found</h1>
      <p className="text-xs text-[#5A7165] max-w-sm">
        The requested platform resource or page builder view does not exist.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-[#3F7659] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#173C2D] transition-all flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Return to Control Center
      </Link>
    </div>
  );
}
