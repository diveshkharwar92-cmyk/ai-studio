import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type DeltaTone = "positive" | "negative" | "neutral";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  deltaTone?: DeltaTone;
  hint?: string;
  className?: string;
}

const deltaClass: Record<DeltaTone, string> = {
  positive: "stat-delta-positive",
  negative: "stat-delta-negative",
  neutral: "stat-delta-neutral",
};

const deltaIcon: Record<DeltaTone, LucideIcon> = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: Minus,
};

/**
 * KPI card for the admin dashboard. `value` is pre-formatted by the caller
 * (e.g. via lib/format.ts) so this component stays presentation-only.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaTone = "neutral",
  hint,
  className,
}: StatCardProps) {
  const DeltaIcon = deltaIcon[deltaTone];

  return (
    <div data-ocid="stat_card" className={cn("stat-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-sm font-medium">
            {title}
          </p>
          <p className="font-display mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
        <div className="stat-icon shrink-0">
          <Icon className="size-4" />
        </div>
      </div>
      {(delta || hint) && (
        <div className="mt-3 flex items-center gap-2">
          {delta && (
            <span className={deltaClass[deltaTone]}>
              <DeltaIcon className="size-3" />
              {delta}
            </span>
          )}
          {hint && (
            <span className="text-muted-foreground truncate text-xs">
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
