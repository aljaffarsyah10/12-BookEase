import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  headerAction,
  footer,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6 dark:border-slate-800">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/50 rounded-b-xl dark:border-slate-800 dark:bg-slate-950/40">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
