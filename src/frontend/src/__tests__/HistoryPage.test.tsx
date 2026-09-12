import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryPage } from "@/pages/HistoryPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    listFiles: vi.fn().mockResolvedValue([]),
    listConversations: vi.fn().mockResolvedValue([]),
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

function renderHistory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HistoryPage />
    </QueryClientProvider>,
  );
}

const file = {
  id: 1n,
  owner: "aaaaa-aa",
  name: "logo.png",
  createdAt: 1_700_000_000_000_000n,
  mimeType: "image/png",
  sizeBytes: 2048n,
};

const conversation = {
  id: 2n,
  title: "Brand ideas",
  owner: "aaaaa-aa",
  createdAt: 1_700_000_000_000_000n,
};

describe("HistoryPage", () => {
  it("shows an empty state when there is no activity", async () => {
    renderHistory();

    expect(await screen.findByText(/No activity yet/i)).toBeInTheDocument();
  });

  it("lists saved files and conversations from the backend", async () => {
    mockActor.listFiles.mockResolvedValue([file]);
    mockActor.listConversations.mockResolvedValue([conversation]);

    renderHistory();

    expect(await screen.findByText("logo.png")).toBeInTheDocument();
    expect(screen.getByText("Brand ideas")).toBeInTheDocument();
    // The file size is rendered from real data.
    expect(screen.getByText(/2\.0 KB/i)).toBeInTheDocument();
  });
});
