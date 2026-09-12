import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createActor } from "@/backend";

export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["caller-role"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProject(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useRenameProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      name,
    }: {
      projectId: bigint;
      name: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.renameProject(projectId, name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteProject(projectId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useFiles() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useConversations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserSettings() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: {
      theme: string;
      notificationsEnabled: boolean;
      displayName: string;
      email: string | null;
      language: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateUserSettings(
        settings.theme,
        settings.notificationsEnabled,
        settings.displayName,
        settings.email,
        settings.language,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}

export function useSubscription() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !isFetching,
  });
}
