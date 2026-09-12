import type { FeatureUsage } from "@/backend";
import { ChartCard } from "@/components/admin/chart-card";
import { NotConnected } from "@/components/admin/not-connected";
import { StatCard } from "@/components/admin/stat-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminFeatureUsage } from "@/hooks/useAdminQueries";
import { formatNumber } from "@/lib/format";
import {
  CheckCircle2,
  Clapperboard,
  Film,
  Image,
  type LucideIcon,
  Mic,
  Palette,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `skeleton-${i}`);

/** Friendly label + icon for known AI tools; falls back to the raw id. */
const TOOL_META: Record<string, { label: string; icon: LucideIcon }> = {
  "text-to-video": { label: "Text to Video", icon: Clapperboard },
  "image-to-video": { label: "Image to Video", icon: Film },
  "video-to-anime": { label: "Video to Anime", icon: Palette },
  "text-to-image": { label: "Text to Image", icon: Image },
  "ai-voice": { label: "AI Voice", icon: Mic },
  "text-to-speech": { label: "AI Voice", icon: Mic },
  "ai-story": { label: "AI Story", icon: Sparkles },
};

function toolLabel(tool: string): string {
  return TOOL_META[tool]?.label ?? tool;
}

function toolIcon(tool: string): LucideIcon {
  return TOOL_META[tool]?.icon ?? Sparkles;
}

function StatCardSkeleton() {
  return (
    <div data-ocid="admin.ai_usage.loading_state" className="stat-card">
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

export function AdminAiUsagePage() {
  const { data, isLoading } = useAdminFeatureUsage();

  const features: FeatureUsage[] = data ?? [];

  const totals = features.reduce(
    (acc, f) => {
      acc.total += Number(f.totalGenerations);
      acc.successful += Number(f.successfulGenerations);
      acc.failed += Number(f.failedGenerations);
      acc.users += Number(f.numberOfUsers);
      return acc;
    },
    { total: 0, successful: 0, failed: 0, users: 0 },
  );

  const chartData = features.map((f) => ({
    tool: toolLabel(f.tool),
    total: Number(f.totalGenerations),
    successful: Number(f.successfulGenerations),
    failed: Number(f.failedGenerations),
  }));

  const chartConfig = {
    total: { label: "Total", color: "var(--chart-1)" },
    successful: { label: "Successful", color: "var(--chart-3)" },
    failed: { label: "Failed", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const hasData = features.length > 0;

  return (
    <div data-ocid="admin.ai_usage.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          AI Usage
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Per-feature generation usage across every AI tool.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <StatCardSkeleton key={id} />
          ))}
        </div>
      ) : !hasData ? (
        <div className="stat-card flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="stat-icon">
            <Sparkles className="size-5" />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="font-display text-base font-semibold">
              No AI provider connected
            </h2>
            <p className="text-muted-foreground text-sm">
              Generation records are empty because no AI provider is connected
              yet. Usage will appear here once generations start.
            </p>
          </div>
          <NotConnected label="AI provider not connected" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Generations"
              value={formatNumber(totals.total)}
              icon={Sparkles}
              hint="Across all AI tools"
            />
            <StatCard
              title="Successful"
              value={formatNumber(totals.successful)}
              icon={CheckCircle2}
              hint="Completed generations"
            />
            <StatCard
              title="Failed"
              value={formatNumber(totals.failed)}
              icon={XCircle}
              hint="Errored generations"
            />
            <StatCard
              title="Active Users"
              value={formatNumber(totals.users)}
              icon={Users}
              hint="Users who generated"
            />
          </div>

          <ChartCard
            title="Generations by Tool"
            description="Total, successful, and failed generations per AI tool."
          >
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="tool"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) =>
                    value.length > 12 ? `${value.slice(0, 11)}…` : value
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="total"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="successful"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="failed"
                  fill="var(--chart-5)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <div className="stat-card overflow-hidden">
            <h2 className="font-display mb-4 text-base font-semibold">
              Usage by Tool
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Successful</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Avg / User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, index) => {
                    const Icon = toolIcon(feature.tool);
                    return (
                      <TableRow
                        key={feature.tool}
                        data-ocid={`admin.ai_usage.row.${index + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="stat-icon size-8">
                              <Icon className="size-4" />
                            </div>
                            <span className="font-medium">
                              {toolLabel(feature.tool)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(feature.totalGenerations)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-success">
                          {formatNumber(feature.successfulGenerations)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          {formatNumber(feature.failedGenerations)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(feature.numberOfUsers)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {feature.averageGenerationsPerUser === undefined
                            ? "—"
                            : feature.averageGenerationsPerUser.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
