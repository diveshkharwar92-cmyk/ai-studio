import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Chart panel wrapper used across the admin analytics pages. Provides a
 * consistent card surface with a title, optional description and action,
 * and a subtle grid backdrop for the chart body.
 */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <div data-ocid="chart_card" className={cn("stat-card", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="bg-grid rounded-lg p-2">{children}</div>
    </div>
  );
}
