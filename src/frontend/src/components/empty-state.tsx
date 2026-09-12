import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
