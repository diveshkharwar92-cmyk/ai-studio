import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createActor } from "@/backend";
import type { ChartRange, DateRange } from "@/backend";

/**
 * Admin-scoped React Query hooks wrapping the backend admin endpoints.
 *
 * Every endpoint is validated server-side against the caller's admin role.
 * When a non-admin caller reaches an admin endpoint the backend traps, so
 * each queryFn catches the error and resolves to a safe empty value instead
 * of crashing the UI. The admin layout gates access via `useIsAdmin` before
 * these hooks are mounted, so this is a defensive fallback only.
 */

const ADMIN_REFETCH_MS = 30_000;

export function useAdminDashboardOverview() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "dashboard-overview"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.adminGetDashboardOverview();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminUserMetrics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "user-metrics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.adminGetUserMetrics();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminChartSeries(range: ChartRange) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "chart-series", range],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.adminGetChartSeries(range);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminFeatureUsage() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "feature-usage"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.adminGetFeatureUsage();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminSubscriptionMetrics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "subscription-metrics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.adminGetSubscriptionMetrics();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminListUsers(
  search: string | null,
  dateRange: DateRange | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "users", search, dateRange],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.adminListUsers(search, dateRange);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminGetUserDetail(userId: Principal | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "user-detail", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.adminGetUserDetail(userId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminGetSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.adminGetSettings();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ADMIN_REFETCH_MS,
  });
}

export function useAdminUpdateOtherCosts() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (otherCosts: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminUpdateOtherCosts(otherCosts);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-overview"],
      });
    },
  });
}

export function useAdminExportUsersCsv() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      search,
      dateRange,
    }: {
      search: string | null;
      dateRange: DateRange | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminExportUsersCsv(search, dateRange);
    },
  });
}

export function useAdminExportAnalyticsCsv() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (dateRange: DateRange | null) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminExportAnalyticsCsv(dateRange);
    },
  });
}
