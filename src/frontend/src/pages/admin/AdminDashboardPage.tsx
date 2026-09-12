import { ConnectionStatus } from "@/backend";
import { NotConnected } from "@/components/admin/not-connected";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminDashboardOverview } from "@/hooks/useAdminQueries";
import { formatINR, formatNumber } from "@/lib/format";
import {
  Coins,
  Gauge,
  IndianRupee,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

const SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.dashboard.loading_state" className="stat-card">
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

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboardOverview();

  const revenueConnected =
    data?.totalRevenue.status === ConnectionStatus.connected;
  const profitConnected =
    data?.estimatedProfit.status === ConnectionStatus.connected;

  return (
    <div data-ocid="admin.dashboard.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of users, activity, and revenue across AI Studio.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={formatNumber(data.totalUsers)}
            icon={Users}
            hint="All registered accounts"
          />
          <StatCard
            title="Active Users Today"
            value={formatNumber(data.activeUsersToday)}
            icon={Zap}
            hint="Active in the last 24 hours"
          />
          <StatCard
            title="Active Users This Month"
            value={formatNumber(data.activeUsersThisMonth)}
            icon={TrendingUp}
            hint="Active in the last 30 days"
          />
          <StatCard
            title="New Users Today"
            value={formatNumber(data.newUsersToday)}
            icon={UserPlus}
            hint="Registered in the last 24 hours"
          />
          <StatCard
            title="Total AI Generations"
            value={formatNumber(data.totalGenerations)}
            icon={Sparkles}
            hint="All-time generations"
          />
          <StatCard
            title="Premium Users"
            value={formatNumber(data.premiumUsers)}
            icon={Gauge}
            hint="Users on a paid plan"
          />
          <StatCard
            title="Total Revenue"
            value={revenueConnected ? formatINR(data.totalRevenue.total) : "—"}
            icon={IndianRupee}
            hint={
              revenueConnected
                ? "All-time revenue"
                : "Payment provider not connected"
            }
          />
          <StatCard
            title="Estimated Profit"
            value={
              profitConnected
                ? formatINR(data.estimatedProfit.estimatedProfit)
                : "—"
            }
            icon={Coins}
            hint={
              profitConnected
                ? "Revenue minus costs"
                : "Payment provider not connected"
            }
          />
        </div>
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="stat-card">
            <h2 className="font-display text-sm font-semibold">
              Total Revenue
            </h2>
            {revenueConnected ? (
              <p className="font-display mt-2 text-2xl font-bold tracking-tight">
                {formatINR(data.totalRevenue.total)}
              </p>
            ) : (
              <div className="mt-3">
                <NotConnected label="Payment provider not connected" />
              </div>
            )}
          </div>
          <div className="stat-card">
            <h2 className="font-display text-sm font-semibold">
              Estimated Profit
            </h2>
            {profitConnected ? (
              <p className="font-display mt-2 text-2xl font-bold tracking-tight">
                {formatINR(data.estimatedProfit.estimatedProfit)}
              </p>
            ) : (
              <div className="mt-3">
                <NotConnected label="Payment provider not connected" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
