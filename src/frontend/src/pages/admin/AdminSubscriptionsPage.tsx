import { ConnectionStatus } from "@/backend";
import { NotConnected } from "@/components/admin/not-connected";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminSubscriptionMetrics } from "@/hooks/useAdminQueries";
import { formatINR, formatNumber } from "@/lib/format";
import {
  BadgeCheck,
  Ban,
  CreditCard,
  RefreshCcw,
  UserPlus,
  Users,
} from "lucide-react";

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.subscriptions.loading_state" className="stat-card">
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

export function AdminSubscriptionsPage() {
  const { data, isLoading } = useAdminSubscriptionMetrics();

  const revenueConnected =
    data?.subscriptionRevenue.status === ConnectionStatus.connected;

  return (
    <div data-ocid="admin.subscriptions.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Subscriptions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Free and premium subscription metrics from real subscription records.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Free Users"
              value={formatNumber(data.freeUsers)}
              icon={Users}
              hint="Users on the free tier"
            />
            <StatCard
              title="Premium Users"
              value={formatNumber(data.premiumUsers)}
              icon={BadgeCheck}
              hint="Users on a paid plan"
            />
            <StatCard
              title="Active Subscriptions"
              value={formatNumber(data.activeSubscriptions)}
              icon={CreditCard}
              hint="Currently active paid plans"
            />
            <StatCard
              title="New Subscriptions"
              value={formatNumber(data.newSubscriptions)}
              icon={UserPlus}
              hint="New sign-ups in the period"
            />
            <StatCard
              title="Renewals"
              value={formatNumber(data.renewals)}
              icon={RefreshCcw}
              hint="Subscriptions renewed"
            />
            <StatCard
              title="Cancelled Subscriptions"
              value={formatNumber(data.cancelledSubscriptions)}
              icon={Ban}
              hint="Subscriptions cancelled"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="stat-card lg:col-span-2">
              <h2 className="font-display text-sm font-semibold">
                Subscription Revenue
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Revenue from paid subscriptions.
              </p>
              {revenueConnected ? (
                <p className="font-display mt-4 text-3xl font-bold tracking-tight">
                  {formatINR(data.subscriptionRevenue.total)}
                </p>
              ) : (
                <div className="mt-4">
                  <NotConnected label="Payment provider not connected" />
                </div>
              )}
            </div>

            <div className="stat-card">
              <h2 className="font-display text-sm font-semibold">
                Plan Breakdown
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Free vs premium share of users.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Free</span>
                    <span className="font-semibold">
                      {formatNumber(data.freeUsers)}
                    </span>
                  </div>
                  <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${freeShare(data.freeUsers, data.premiumUsers)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="font-semibold">
                      {formatNumber(data.premiumUsers)}
                    </span>
                  </div>
                  <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{
                        width: `${freeShare(data.premiumUsers, data.freeUsers)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function freeShare(part: bigint, other: bigint): number {
  const total = Number(part) + Number(other);
  if (total === 0) return 0;
  return Math.round((Number(part) / total) * 100);
}
