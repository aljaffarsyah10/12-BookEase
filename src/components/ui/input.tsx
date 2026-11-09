import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-slate-200/90 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs transition-all duration-150 outline-none placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-3 focus-visible:ring-indigo-500/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 aria-invalid:border-rose-500 aria-invalid:ring-3 aria-invalid:ring-rose-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-indigo-500 dark:focus-visible:ring-indigo-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
