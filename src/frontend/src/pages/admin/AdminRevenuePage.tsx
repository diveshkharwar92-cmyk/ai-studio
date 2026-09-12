import { ConnectionStatus } from "@/backend";
import { NotConnected } from "@/components/admin/not-connected";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminDashboardOverview } from "@/hooks/useAdminQueries";
import { formatINR } from "@/lib/format";
import {
  BadgePercent,
  CalendarDays,
  CalendarRange,
  IndianRupee,
  Megaphone,
  Receipt,
  Repeat,
  Wallet,
} from "lucide-react";

const SKELETON_IDS = Array.from({ length: 7 }, (_, i) => `skeleton-${i}`);

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.revenue.loading_state" className="stat-card">
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

export function AdminRevenuePage() {
  const { data, isLoading } = useAdminDashboardOverview();

  const revenue = data?.totalRevenue;
  const connected = revenue?.status === ConnectionStatus.connected;

  return (
    <div data-ocid="admin.revenue.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Revenue
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Revenue across subscriptions, one-time purchases, and ads, in Indian
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
                Payment &amp; ad integrations not connected
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Revenue figures will appear here once a payment provider and ad
                network are wired up. No financial data is shown until then.
              </p>
            </div>
          </div>
          <NotConnected
            label="Payment provider not connected"
            className="shrink-0"
          />
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue Today"
            value={connected ? formatINR(revenue.today) : "—"}
            icon={CalendarDays}
            hint={connected ? "Earned today" : "Payment provider not connected"}
          />
          <StatCard
            title="Revenue This Week"
            value={connected ? formatINR(revenue.thisWeek) : "—"}
            icon={CalendarRange}
            hint={
              connected
                ? "Earned in the last 7 days"
                : "Payment provider not connected"
            }
          />
          <StatCard
            title="Revenue This Month"
            value={connected ? formatINR(revenue.thisMonth) : "—"}
            icon={Wallet}
            hint={
              connected
                ? "Earned in the last 30 days"
                : "Payment provider not connected"
            }
          />
          <StatCard
            title="Total Revenue"
            value={connected ? formatINR(revenue.total) : "—"}
            icon={IndianRupee}
            hint={
              connected ? "All-time revenue" : "Payment provider not connected"
            }
          />
          <StatCard
            title="Subscription Revenue"
            value={connected ? formatINR(revenue.subscription) : "—"}
            icon={Repeat}
            hint={
              connected
                ? "Recurring subscription income"
                : "Payment provider not connected"
            }
          />
          <StatCard
            title="One-Time Purchase Revenue"
            value={connected ? formatINR(revenue.oneTime) : "—"}
            icon={Receipt}
            hint={
              connected
                ? "One-off purchase income"
                : "Payment provider not connected"
            }
          />
          <StatCard
            title="Advertisement Revenue"
            value={connected ? formatINR(revenue.advertisement) : "—"}
            icon={Megaphone}
            hint={connected ? "Ad network income" : "Ad network not connected"}
          />
        </div>
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="stat-icon">
                <Repeat className="size-4" />
              </div>
              <h2 className="font-display text-sm font-semibold">
                Subscription Revenue
              </h2>
            </div>
            {connected ? (
              <p className="font-display mt-3 text-2xl font-bold tracking-tight">
                {formatINR(revenue.subscription)}
              </p>
            ) : (
              <div className="mt-3">
                <NotConnected label="Payment provider not connected" />
              </div>
            )}
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="stat-icon">
                <Megaphone className="size-4" />
              </div>
              <h2 className="font-display text-sm font-semibold">
                Advertisement Revenue
              </h2>
            </div>
            {connected ? (
              <p className="font-display mt-3 text-2xl font-bold tracking-tight">
                {formatINR(revenue.advertisement)}
              </p>
            ) : (
              <div className="mt-3">
                <NotConnected label="Ad network not connected" />
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <div className="stat-icon">
              <BadgePercent className="size-4" />
            </div>
            <h2 className="font-display text-sm font-semibold">
              Revenue Breakdown
            </h2>
          </div>
          {connected ? (
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">
                  Subscription revenue
                </dt>
                <dd className="font-display text-sm font-semibold">
                  {formatINR(revenue.subscription)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">
                  One-time purchase revenue
                </dt>
                <dd className="font-display text-sm font-semibold">
                  {formatINR(revenue.oneTime)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">
                  Advertisement revenue
                </dt>
                <dd className="font-display text-sm font-semibold">
                  {formatINR(revenue.advertisement)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground text-sm">Total revenue</dt>
                <dd className="font-display text-sm font-semibold">
                  {formatINR(revenue.total)}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="mt-3">
              <NotConnected label="Payment and ad integrations not connected" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
