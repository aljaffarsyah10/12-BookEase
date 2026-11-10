import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.08),rgba(255,255,255,0))] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-slate-900 font-bold tracking-tight text-xl group"
        >
          <span className="flex size-10.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white shadow-xs shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <CalendarCheck className="size-5.5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">BookEase</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
    </div>
  );
}

