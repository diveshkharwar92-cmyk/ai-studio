import { ConnectionStatus } from "@/backend";
import { NotConnected } from "@/components/admin/not-connected";
import { StatCard } from "@/components/admin/stat-card";
import {
  useAdminDashboardOverview,
  useAdminGetSettings,
} from "@/hooks/useAdminQueries";
import { formatINR, formatPercent } from "@/lib/format";
import {
  BadgePercent,
  Coins,
  IndianRupee,
  Receipt,
  Settings2,
  Sparkles,
  Wallet,
} from "lucide-react";

const SKELETON_IDS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.costs.loading_state" className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          <div className="bg-muted h-7 w-20 animate-pulse rounded" />
        </div>
        <div className="bg-muted size-9 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

export function AdminCostsPage() {
  const { data, isLoading } = useAdminDashboardOverview();
  const { data: settings } = useAdminGetSettings();

  const profit = data?.estimatedProfit;
  const connected = profit?.status === ConnectionStatus.connected;

  const otherCostsConnected = settings !== null && settings !== undefined;

  return (
    <div data-ocid="admin.costs.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Costs &amp; Profit
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI API costs, other costs, revenue, and estimated profit in Indian
          Rupees (₹).
        </p>
      </div>

      {!isLoading && data && !connected && (
        <div className="stat-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="stat-icon shrink-0">
              <Wallet className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold">
                AI and payment integrations not connected
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Estimated profit is calculated as Total Revenue − AI API Cost −
                Other Costs, but only from real connected values. No figures are
                shown until an AI provider and payment provider are wired up.
              </p>
            </div>
          </div>
          <NotConnected
            label="AI &amp; payment providers not connected"
            className="shrink-0"
          />
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total AI API Cost"
            value={connected ? formatINR(profit.aiApiCost) : "—"}
            icon={Sparkles}
            hint={
              connected ? "AI provider usage cost" : "AI provider not connected"
            }
          />
          <StatCard
            title="Other Costs"
            value={otherCostsConnected ? formatINR(settings.otherCosts) : "—"}
            icon={Settings2}
            hint={
              otherCostsConnected
                ? "Admin-configured in Settings"
                : "No other costs configured"
            }
          />
          <StatCard
            title="Total Revenue"
            value={connected ? formatINR(profit.totalRevenue) : "—"}
            icon={IndianRupee}
            hint={
              connected ? "All-time revenue" : "Payment provider not connected"
            }
          />
          <StatCard
            title="Estimated Profit"
            value={connected ? formatINR(profit.estimatedProfit) : "—"}
            icon={Coins}
            hint={
              connected
                ? "Revenue minus costs"
                : "Revenue &amp; costs not connected"
            }
          />
          <StatCard
            title="Profit Margin"
            value={
              connected && profit.profitMargin !== undefined
                ? formatPercent(profit.profitMargin)
                : "—"
            }
            icon={BadgePercent}
            hint={
              connected
                ? "Profit as a share of revenue"
                : "Revenue &amp; costs not connected"
            }
          />
        </div>
      )}

      {!isLoading && data && (
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <div className="stat-icon">
              <Receipt className="size-4" />
            </div>
            <h2 className="font-display text-sm font-semibold">
              Estimated Profit Breakdown
            </h2>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Estimated Profit = Total Revenue − AI API Cost − Other Costs.
          </p>
          {connected ? (
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">Total revenue</dt>
                <dd className="font-display text-sm font-semibold">
                  {formatINR(profit.totalRevenue)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">AI API cost</dt>
                <dd className="font-display text-sm font-semibold">
                  − {formatINR(profit.aiApiCost)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">Other costs</dt>
                <dd className="font-display text-sm font-semibold">
                  − {formatINR(profit.otherCosts)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">
                  Estimated profit
                </dt>
                <dd className="font-display text-sm font-bold">
                  {formatINR(profit.estimatedProfit)}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-sm">
                  Total revenue
                </span>
                <NotConnected label="Payment provider not connected" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-sm">
                  AI API cost
                </span>
                <NotConnected label="AI provider not connected" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-sm">
                  Other costs
                </span>
                {otherCostsConnected ? (
                  <span className="font-display text-sm font-semibold">
                    {formatINR(settings.otherCosts)}
                  </span>
                ) : (
                  <NotConnected label="No other costs configured" />
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-muted-foreground text-sm">
                  Estimated profit
                </span>
                <NotConnected label="Revenue &amp; costs not connected" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
