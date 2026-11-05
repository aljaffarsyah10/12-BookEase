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
        "rounded-xl border border-slate-200/80 bg-white shadow-xs",
        className
      )}
    >
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-slate-500">
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
        <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

