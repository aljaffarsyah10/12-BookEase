"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Maaf, data belum dapat dimuat saat ini. Silakan coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/40 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-4 gap-2"
        >
          <RotateCcw className="size-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

