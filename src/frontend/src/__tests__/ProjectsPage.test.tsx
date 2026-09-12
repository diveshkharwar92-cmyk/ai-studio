import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectsPage } from "@/pages/ProjectsPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    listProjects: vi.fn().mockResolvedValue([]),
    createProject: vi.fn(),
    renameProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    clear: vi.fn(),
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

function renderProjects() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsPage />
    </QueryClientProvider>,
  );
}

const project = {
  id: 1n,
  owner: "aaaaa-aa",
  name: "Brand refresh",
  createdAt: 1_700_000_000_000_000n,
  updatedAt: 1_700_000_000_000_000n,
};

describe("ProjectsPage", () => {
  it("shows an empty state when there are no projects", async () => {
    renderProjects();

    expect(await screen.findByText(/No projects yet/i)).toBeInTheDocument();
  });

  it("creates a project through the backend and lists it", async () => {
    mockActor.createProject.mockResolvedValue(project);
    mockActor.listProjects.mockResolvedValue([project]);

    renderProjects();

    fireEvent.click(
      await screen.findByRole("button", { name: /New project/i }),
    );

    const input = screen.getByLabelText(/Project name/i);
    fireEvent.change(input, { target: { value: "Brand refresh" } });
    fireEvent.click(screen.getByRole("button", { name: /Create project/i }));

    await waitFor(() => {
      expect(mockActor.createProject).toHaveBeenCalledWith("Brand refresh");
    });
    expect(await screen.findByText("Brand refresh")).toBeInTheDocument();
  });
});
