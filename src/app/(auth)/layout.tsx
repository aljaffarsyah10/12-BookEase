import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 text-slate-900 font-semibold"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <CalendarCheck className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">BookEase</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
    </div>
  );
}

