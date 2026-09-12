import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartRange, type DateRange } from "@/backend";
import { ChartCard } from "@/components/admin/chart-card";
import { DateFilter } from "@/components/admin/date-filter";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import {
  useAdminChartSeries,
  useAdminExportAnalyticsCsv,
  useAdminUserMetrics,
} from "@/hooks/useAdminQueries";
import { formatNumber, formatPercent, timestampToDate } from "@/lib/format";
import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Download,
  Repeat,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.analytics.loading_state" className="stat-card">
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

function readRangeFromUrl(): DateRange | null {
  const params = new URLSearchParams(window.location.search);
  switch (params.get("range")) {
    case "today":
      return { __kind__: "today", today: null };
    case "last7":
      return { __kind__: "last7Days", last7Days: null };
    case "last30":
      return { __kind__: "last30Days", last30Days: null };
    case "last90":
      return { __kind__: "last90Days", last90Days: null };
    case "custom": {
      const from = params.get("from");
      const to = params.get("to");
      if (from && to) {
        return {
          __kind__: "custom",
          custom: { from: BigInt(from), to: BigInt(to) },
        };
      }
      return null;
    }
    default:
      return null;
  }
}

function writeRangeToUrl(range: DateRange | null) {
  const params = new URLSearchParams(window.location.search);
  if (!range) {
    params.delete("range");
    params.delete("from");
    params.delete("to");
  } else {
    switch (range.__kind__) {
      case "today":
        params.set("range", "today");
        params.delete("from");
        params.delete("to");
        break;
      case "last7Days":
        params.set("range", "last7");
        params.delete("from");
        params.delete("to");
        break;
      case "last30Days":
        params.set("range", "last30");
        params.delete("from");
        params.delete("to");
        break;
      case "last90Days":
        params.set("range", "last90");
        params.delete("from");
        params.delete("to");
        break;
      case "custom":
        params.set("range", "custom");
        params.set("from", range.custom.from.toString());
        params.set("to", range.custom.to.toString());
        break;
    }
  }
  const qs = params.toString();
  const next = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;
  window.history.replaceState(null, "", next);
}

function rangeToChartRange(range: DateRange | null): ChartRange {
  switch (range?.__kind__) {
    case "today":
    case "last7Days":
      return ChartRange.last7Days;
    case "last30Days":
      return ChartRange.last30Days;
    case "last90Days":
      return ChartRange.last90Days;
    default:
      return ChartRange.last30Days;
  }
}

function shortDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" } as const;
const GRID_STROKE = "var(--border)";

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange | null>(() =>
    readRangeFromUrl(),
  );

  useEffect(() => {
    writeRangeToUrl(range);
  }, [range]);

  const chartRange = rangeToChartRange(range);

  const { data: metrics, isLoading } = useAdminUserMetrics();
  const { data: series, isLoading: chartLoading } =
    useAdminChartSeries(chartRange);

  const exportMutation = useAdminExportAnalyticsCsv();

  const handleExport = () => {
    exportMutation.mutate(range, {
      onSuccess: (csv) => {
        if (!csv) return;
        const blob = new Blob([csv.content], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = csv.filename;
        anchor.click();
        URL.revokeObjectURL(url);
        toast.success("Analytics exported");
      },
      onError: () => toast.error("Could not export analytics"),
    });
  };

  const chartData = useMemo(
    () =>
      (series?.points ?? []).map((p) => ({
        date: shortDate(p.date),
        newUsers: Number(p.newUsers),
        activeUsers: Number(p.activeUsers),
        retentionRate: p.retentionRate ?? 0,
      })),
    [series],
  );

  const retentionData = useMemo(
    () =>
      (series?.points ?? [])
        .filter((p) => p.retentionRate !== undefined)
        .map((p) => ({
          date: shortDate(p.date),
          retentionRate: p.retentionRate as number,
        })),
    [series],
  );

  const rangeLabel =
    range?.__kind__ === "custom"
      ? "Custom range"
      : range?.__kind__ === "today"
        ? "Today"
        : range?.__kind__ === "last7Days"
          ? "Last 7 days"
          : range?.__kind__ === "last90Days"
            ? "Last 90 days"
            : "Last 30 days";

  return (
    <div data-ocid="admin.analytics.page" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            User, activity, and retention trends across AI Studio.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.analytics.export_button"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download />
            {exportMutation.isPending ? "Exporting…" : "Export CSV"}
          </Button>
          <DateFilter value={range} onChange={setRange} />
        </div>
      </div>

      {isLoading || !metrics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Registered"
            value={formatNumber(metrics.totalRegistered)}
            icon={Users}
            hint="All-time registered accounts"
          />
          <StatCard
            title="New Today"
            value={formatNumber(metrics.newToday)}
            icon={UserPlus}
            hint="Registered in the last 24 hours"
          />
          <StatCard
            title="New This Week"
            value={formatNumber(metrics.newThisWeek)}
            icon={CalendarPlus}
            hint="Registered in the last 7 days"
          />
          <StatCard
            title="New This Month"
            value={formatNumber(metrics.newThisMonth)}
            icon={CalendarClock}
            hint="Registered in the last 30 days"
          />
          <StatCard
            title="Daily Active"
            value={formatNumber(metrics.dailyActive)}
            icon={UserCheck}
            hint="Active in the last 24 hours"
          />
          <StatCard
            title="Monthly Active"
            value={formatNumber(metrics.monthlyActive)}
            icon={TrendingUp}
            hint="Active in the last 30 days"
          />
          <StatCard
            title="Returning Users"
            value={formatNumber(metrics.returningUsers)}
            icon={Repeat}
            hint="Users active on multiple days"
          />
          <StatCard
            title="Retention Rate"
            value={formatPercent(metrics.retentionRate)}
            icon={CalendarCheck}
            hint="Share of users returning"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="New Users"
          description={`New user registrations over ${rangeLabel.toLowerCase()}`}
        >
          {chartLoading || !series ? (
            <div className="bg-muted h-64 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={GRID_STROKE}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  name="New users"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Active Users"
          description={`Daily active users over ${rangeLabel.toLowerCase()}`}
        >
          {chartLoading || !series ? (
            <div className="bg-muted h-64 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={GRID_STROKE}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active users"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Retention Rate"
          description={`Share of users returning over ${rangeLabel.toLowerCase()}`}
          className="lg:col-span-2"
        >
          {chartLoading || !series ? (
            <div className="bg-muted h-64 animate-pulse rounded-lg" />
          ) : retentionData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No retention data available for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={retentionData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={GRID_STROKE}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Retention",
                  ]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retentionRate"
                  name="Retention"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
