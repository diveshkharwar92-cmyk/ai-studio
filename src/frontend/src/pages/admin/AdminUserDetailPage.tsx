import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock,
  Coins,
  CreditCard,
  Gauge,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo } from "react";

import { AccountStatus, AnalyticsEventType, SubscriptionTier } from "@/backend";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminGetUserDetail } from "@/hooks/useAdminQueries";
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatINR,
  formatNumber,
  formatPercent,
} from "@/lib/format";

const eventTypeLabels: Record<AnalyticsEventType, string> = {
  [AnalyticsEventType.registration]: "Registration",
  [AnalyticsEventType.login]: "Login",
  [AnalyticsEventType.generationStarted]: "Generation started",
  [AnalyticsEventType.generationCompleted]: "Generation completed",
  [AnalyticsEventType.generationFailed]: "Generation failed",
  [AnalyticsEventType.subscriptionStarted]: "Subscription started",
  [AnalyticsEventType.subscriptionRenewed]: "Subscription renewed",
  [AnalyticsEventType.subscriptionCancelled]: "Subscription cancelled",
  [AnalyticsEventType.paymentCompleted]: "Payment completed",
};

function parseUserId(raw: string | undefined): Principal | null {
  if (!raw) return null;
  try {
    return Principal.fromText(raw);
  } catch {
    return null;
  }
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="stat-icon mt-0.5 shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function AdminUserDetailPage() {
  const { userId } = useParams({ strict: false });
  const principal = useMemo(() => parseUserId(userId), [userId]);
  const { data, isLoading } = useAdminGetUserDetail(principal);

  const notFound = !isLoading && (!principal || !data);

  if (isLoading) {
    return (
      <div data-ocid="admin.user_detail.loading_state" className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        data-ocid="admin.user_detail.empty_state"
        className="stat-card flex flex-col items-center justify-center gap-3 py-20 text-center"
      >
        <div className="stat-icon">
          <UserRound className="size-6" />
        </div>
        <h1 className="font-display text-lg font-semibold">User not found</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          This user does not exist or is not accessible. The account may have
          been removed, or the ID in the address may be invalid.
        </p>
        <Button
          type="button"
          variant="secondary"
          data-ocid="admin.user_detail.back_button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft />
          Back to users
        </Button>
      </div>
    );
  }

  const { user, metrics, featureUsage, recentEvents } = data!;
  const isActive = user.accountStatus === AccountStatus.active;
  const isPro = user.subscriptionStatus.tier === SubscriptionTier.pro;

  return (
    <div data-ocid="admin.user_detail.page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="stat-icon mt-1 shrink-0">
            <UserRound className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {user.name || "Unnamed user"}
              </h1>
              <Badge
                variant={isActive ? "default" : "secondary"}
                data-ocid="admin.user_detail.account_status"
              >
                {isActive ? "Active" : "Disabled"}
              </Badge>
              <Badge
                variant={isPro ? "default" : "outline"}
                data-ocid="admin.user_detail.subscription_badge"
              >
                {isPro ? "Pro" : "Free"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {user.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
              )}
              <span className="font-mono text-xs">{user.id.toText()}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-ocid="admin.user_detail.back_button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft />
          Back to users
        </Button>
      </div>

      {/* Profile info */}
      <div className="stat-card">
        <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold">
          <UserRound className="size-4" />
          Profile
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileRow
            icon={CalendarDays}
            label="Registered"
            value={formatDateTime(user.registeredAt)}
          />
          <ProfileRow
            icon={Clock}
            label="Last active"
            value={formatDateTime(user.lastActiveAt)}
          />
          <ProfileRow
            icon={CreditCard}
            label="Subscription"
            value={
              isPro
                ? `Pro${
                    user.subscriptionStatus.expiresAt !== undefined
                      ? ` · expires ${formatDate(
                          user.subscriptionStatus.expiresAt,
                        )}`
                      : ""
                  }`
                : "Free"
            }
          />
          <ProfileRow
            icon={ShieldCheck}
            label="Account status"
            value={isActive ? "Active" : "Disabled"}
          />
          <ProfileRow
            icon={Sparkles}
            label="AI generations"
            value={formatNumber(user.aiGenerations)}
          />
          <ProfileRow
            icon={Coins}
            label="Total amount spent"
            value={formatINR(user.totalAmountSpent)}
          />
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h2 className="font-display mb-3 flex items-center gap-2 text-base font-semibold">
          <Gauge className="size-4" />
          Activity metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total registered"
            value={formatCompact(metrics.totalRegistered)}
            icon={Users}
          />
          <StatCard
            title="New today"
            value={formatCompact(metrics.newToday)}
            icon={Users}
          />
          <StatCard
            title="New this week"
            value={formatCompact(metrics.newThisWeek)}
            icon={Users}
          />
          <StatCard
            title="New this month"
            value={formatCompact(metrics.newThisMonth)}
            icon={Users}
          />
          <StatCard
            title="Daily active"
            value={formatCompact(metrics.dailyActive)}
            icon={Activity}
          />
          <StatCard
            title="Monthly active"
            value={formatCompact(metrics.monthlyActive)}
            icon={Activity}
          />
          <StatCard
            title="Returning users"
            value={formatCompact(metrics.returningUsers)}
            icon={Users}
          />
          <StatCard
            title="Retention rate"
            value={formatPercent(metrics.retentionRate)}
            icon={Gauge}
          />
        </div>
      </div>

      {/* Feature usage */}
      <div className="stat-card">
        <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4" />
          AI feature usage
        </h2>
        {featureUsage.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No AI feature usage recorded for this user.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">Tool</th>
                  <th className="py-2 pr-4 text-right font-medium">
                    Total generations
                  </th>
                  <th className="py-2 pr-4 text-right font-medium">
                    Successful
                  </th>
                  <th className="py-2 pr-4 text-right font-medium">Failed</th>
                  <th className="py-2 text-right font-medium">Avg / user</th>
                </tr>
              </thead>
              <tbody>
                {featureUsage.map((usage, index) => (
                  <tr
                    key={`${usage.tool}-${index}`}
                    data-ocid={`admin.user_detail.feature_row.${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium">{usage.tool}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {formatNumber(usage.totalGenerations)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {formatNumber(usage.successfulGenerations)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {formatNumber(usage.failedGenerations)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {usage.averageGenerationsPerUser !== undefined
                        ? usage.averageGenerationsPerUser.toFixed(1)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent events */}
      <div className="stat-card">
        <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold">
          <Activity className="size-4" />
          Recent events
        </h2>
        {recentEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No recent analytics events for this user.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event, index) => (
                  <tr
                    key={`${event.id.toString()}-${index}`}
                    data-ocid={`admin.user_detail.event_row.${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium">
                      {eventTypeLabels[event.eventType] ?? event.eventType}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="outline">{event.eventType}</Badge>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatDateTime(event.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
