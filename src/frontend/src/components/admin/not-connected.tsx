import { PlugZap } from "lucide-react";

import { cn } from "@/lib/utils";

interface NotConnectedProps {
  label?: string;
  className?: string;
}

/**
 * Reusable "Not connected" state shown for integrations that are not wired
 * up (payments, ads, AI provider). We never invent financial or usage data,
 * so unconnected sources render this instead of fabricated numbers.
 */
export function NotConnected({
  label = "Not connected",
  className,
}: NotConnectedProps) {
  return (
    <div
      data-ocid="not_connected"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <PlugZap className="size-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
