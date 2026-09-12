import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SubscriptionPage } from "@/pages/SubscriptionPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    getSubscription: vi.fn().mockResolvedValue(null),
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

function renderSubscription() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SubscriptionPage />
    </QueryClientProvider>,
  );
}

describe("SubscriptionPage", () => {
  it("shows Free and Pro plans with distinct usage limits", async () => {
    renderSubscription();

    expect(await screen.findByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();

    // Distinct usage limits for each tier.
    expect(
      screen.getByText(/Up to 20 generations per month/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Unlimited AI generations/i)).toBeInTheDocument();
  });

  it("shows that payments are not processed yet", async () => {
    renderSubscription();

    expect(
      await screen.findByText(/Payments are not processed yet/i),
    ).toBeInTheDocument();
  });
});
