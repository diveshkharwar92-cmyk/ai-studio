import { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AccountStatus,
  ChartRange,
  ConnectionStatus,
  SubscriptionTier,
} from "@/backend";
import type {
  AdminUserRow,
  ChartSeries,
  DashboardOverview,
  FeatureUsage,
  SubscriptionMetrics,
  UserMetrics,
} from "@/backend";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAiUsagePage } from "@/pages/admin/AdminAiUsagePage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminSubscriptionsPage } from "@/pages/admin/AdminSubscriptionsPage";
import { AdminUserDetailPage } from "@/pages/admin/AdminUserDetailPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    isCallerAdmin: vi.fn(),
    adminGetDashboardOverview: vi.fn(),
    adminGetUserMetrics: vi.fn(),
    adminGetChartSeries: vi.fn(),
    adminGetFeatureUsage: vi.fn(),
    adminGetSubscriptionMetrics: vi.fn(),
    adminListUsers: vi.fn(),
    adminGetUserDetail: vi.fn(),
    adminGetSettings: vi.fn(),
    adminUpdateOtherCosts: vi.fn(),
    adminExportUsersCsv: vi.fn(),
    adminExportAnalyticsCsv: vi.fn(),
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: true,
    login: vi.fn(),
    clear: vi.fn(),
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

const notConnected: ConnectionStatus = ConnectionStatus.notConnected;

const overview: DashboardOverview = {
  totalUsers: 1200n,
  activeUsersToday: 45n,
  activeUsersThisMonth: 320n,
  newUsersToday: 12n,
  totalGenerations: 9876n,
  premiumUsers: 88n,
  totalRevenue: {
    status: notConnected,
    today: 0n,
    thisWeek: 0n,
    thisMonth: 0n,
    total: 0n,
    subscription: 0n,
    oneTime: 0n,
    advertisement: 0n,
  },
  estimatedProfit: {
    status: notConnected,
    totalRevenue: 0n,
    aiApiCost: 0n,
    otherCosts: 0n,
    estimatedProfit: 0n,
  },
};

const userMetrics: UserMetrics = {
  totalRegistered: 1200n,
  newToday: 12n,
  newThisWeek: 80n,
  newThisMonth: 300n,
  dailyActive: 45n,
  monthlyActive: 320n,
  returningUsers: 150n,
  retentionRate: 42.5,
};

const chartSeries: ChartSeries = {
  range: ChartRange.last30Days,
  points: [
    {
      date: 1726000000000000000n,
      newUsers: 10n,
      activeUsers: 40n,
      retentionRate: 40,
    },
    {
      date: 1726086400000000000n,
      newUsers: 12n,
      activeUsers: 45n,
      retentionRate: 42.5,
    },
  ],
};

const featureUsage: FeatureUsage[] = [
  {
    tool: "text-to-image",
    totalGenerations: 500n,
    successfulGenerations: 480n,
    failedGenerations: 20n,
    numberOfUsers: 60n,
    averageGenerationsPerUser: 8.33,
  },
  {
    tool: "ai-chat",
    totalGenerations: 900n,
    successfulGenerations: 850n,
    failedGenerations: 50n,
    numberOfUsers: 120n,
    averageGenerationsPerUser: 7.5,
  },
];

const subscriptionMetrics: SubscriptionMetrics = {
  freeUsers: 1112n,
  premiumUsers: 88n,
  activeSubscriptions: 80n,
  newSubscriptions: 10n,
  renewals: 5n,
  cancelledSubscriptions: 2n,
  subscriptionRevenue: {
    status: notConnected,
    today: 0n,
    thisWeek: 0n,
    thisMonth: 0n,
    total: 0n,
    subscription: 0n,
    oneTime: 0n,
    advertisement: 0n,
  },
};

const adminUser: AdminUserRow = {
  id: Principal.fromText("aaaaa-aa"),
  name: "Ada Lovelace",
  email: "ada@example.com",
  registeredAt: 1726000000000000000n,
  lastActiveAt: 1726086400000000000n,
  aiGenerations: 42n,
  subscriptionStatus: {
    owner: Principal.fromText("aaaaa-aa"),
    tier: SubscriptionTier.pro,
  },
  totalAmountSpent: 5000n,
  accountStatus: AccountStatus.active,
};

function seedAdminData() {
  mockActor.adminGetDashboardOverview.mockResolvedValue(overview);
  mockActor.adminGetUserMetrics.mockResolvedValue(userMetrics);
  mockActor.adminGetChartSeries.mockResolvedValue(chartSeries);
  mockActor.adminGetFeatureUsage.mockResolvedValue(featureUsage);
  mockActor.adminGetSubscriptionMetrics.mockResolvedValue(subscriptionMetrics);
  mockActor.adminListUsers.mockResolvedValue([adminUser]);
  mockActor.adminGetSettings.mockResolvedValue({ otherCosts: 1000n });
}

function renderPage(node: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>,
  );
}

/**
 * Render a component inside a minimal router so router hooks (useNavigate,
 * useParams, Link) resolve. The admin layout route hosts the users and
 * user-detail routes so the per-user navigation works.
 */
function renderWithRouter(_node: React.ReactNode, initialPath = "/admin") {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminLayout,
  });
  const usersRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "/users",
    component: AdminUsersPage,
  });
  const userDetailRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "/users/$userId",
    component: AdminUserDetailPage,
  });
  const routeTree = rootRoute.addChildren([
    adminRoute.addChildren([usersRoute, userDetailRoute]),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Admin route protection", () => {
  it("redirects a non-admin away from /admin and never shows admin data", async () => {
    mockActor.isCallerAdmin.mockResolvedValue(false);
    renderWithRouter(<AdminUsersPage />, "/admin/users");

    // The admin layout shows the denied state while it redirects.
    await screen.findByText(/Admin access required/i);

    // Admin data endpoints are never called for a non-admin caller.
    expect(mockActor.adminListUsers).not.toHaveBeenCalled();
  });

  it("shows admin navigation and data for an admin caller", async () => {
    seedAdminData();
    mockActor.isCallerAdmin.mockResolvedValue(true);
    renderWithRouter(<AdminUsersPage />, "/admin/users");

    // Admin sidebar navigation is visible.
    expect(
      await screen.findByRole("link", { name: /Dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Users/i })).toBeInTheDocument();

    // The users table renders real backend data.
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  });
});

describe("Admin users page", () => {
  it("lists users and opens a per-user detail view", async () => {
    seedAdminData();
    mockActor.isCallerAdmin.mockResolvedValue(true);
    mockActor.adminGetUserDetail.mockResolvedValue({
      user: adminUser,
      metrics: userMetrics,
      featureUsage,
      recentEvents: [],
    });
    renderWithRouter(<AdminUsersPage />, "/admin/users");

    const nameCell = await screen.findByText("Ada Lovelace");
    expect(nameCell).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();

    // Clicking the user ID link opens the per-user detail page.
    const userLink = screen.getByRole("link", { name: /aaaaa-aa/i });
    await userEvent.click(userLink);

    expect(
      await screen.findByRole("heading", { name: /Ada Lovelace/i }),
    ).toBeInTheDocument();
    expect(mockActor.adminGetUserDetail).toHaveBeenCalled();
  });

  it("filters the user table by search", async () => {
    seedAdminData();
    mockActor.isCallerAdmin.mockResolvedValue(true);
    renderWithRouter(<AdminUsersPage />, "/admin/users");

    const search = await screen.findByRole("searchbox", {
      name: /Search users/i,
    });
    await userEvent.type(search, "ada");

    // The debounced search triggers a new adminListUsers call with the query.
    await vi.waitFor(() => {
      expect(
        mockActor.adminListUsers.mock.calls.some((call) => call[0] === "ada"),
      ).toBe(true);
    });
  });

  it("exports users as a downloadable CSV", async () => {
    seedAdminData();
    mockActor.isCallerAdmin.mockResolvedValue(true);
    mockActor.adminExportUsersCsv.mockResolvedValue({
      filename: "users.csv",
      content: "id,name\n1,Ada",
    });
    // jsdom does not implement URL.createObjectURL/revokeObjectURL.
    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      writable: true,
    });
    const click = vi.fn();
    HTMLAnchorElement.prototype.click = click;

    renderWithRouter(<AdminUsersPage />, "/admin/users");

    const exportButton = await screen.findByRole("button", {
      name: /Export CSV/i,
    });
    await userEvent.click(exportButton);

    await vi.waitFor(() => {
      expect(mockActor.adminExportUsersCsv).toHaveBeenCalled();
    });
    expect(click).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
  });
});

describe("Admin dashboard page", () => {
  it("renders all eight stat cards from real backend values", async () => {
    seedAdminData();
    renderPage(<AdminDashboardPage />);

    expect(await screen.findByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Active Users Today")).toBeInTheDocument();
    expect(screen.getByText("Active Users This Month")).toBeInTheDocument();
    expect(screen.getByText("New Users Today")).toBeInTheDocument();
    expect(screen.getByText("Total AI Generations")).toBeInTheDocument();
    expect(screen.getByText("Premium Users")).toBeInTheDocument();
    // "Total Revenue" appears in both the stat card and the breakdown section.
    expect(screen.getAllByText("Total Revenue").length).toBeGreaterThan(0);
    // "Estimated Profit" appears in both the stat card and the breakdown section.
    expect(screen.getAllByText("Estimated Profit").length).toBeGreaterThan(0);

    // Real values from the mocked backend are rendered (Indian grouping).
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("9,876")).toBeInTheDocument();
  });

  it("shows 'Not connected' for revenue and profit when no payment provider", async () => {
    seedAdminData();
    renderPage(<AdminDashboardPage />);

    // "Payment provider not connected" appears in the stat card hints and the
    // breakdown sections.
    expect(
      (await screen.findAllByText("Payment provider not connected")).length,
    ).toBeGreaterThan(0);
    // No fabricated financial figures are shown.
    expect(screen.queryByText("₹0")).not.toBeInTheDocument();
  });
});

describe("Admin AI usage page", () => {
  it("renders per-feature generation counts from real backend data", async () => {
    seedAdminData();
    renderPage(<AdminAiUsagePage />);

    expect(await screen.findByText("Text to Image")).toBeInTheDocument();
    // "ai-chat" is not in the tool label map, so it falls back to the raw id.
    expect(screen.getByText("ai-chat")).toBeInTheDocument();
    // Totals computed from the mocked feature usage (500 + 900).
    expect(screen.getByText("1,400")).toBeInTheDocument();
  });
});

describe("Admin subscriptions page", () => {
  it("renders per-status subscription counts", async () => {
    seedAdminData();
    renderPage(<AdminSubscriptionsPage />);

    expect(await screen.findByText("Free Users")).toBeInTheDocument();
    expect(screen.getByText("Premium Users")).toBeInTheDocument();
    expect(screen.getByText("Active Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("New Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Renewals")).toBeInTheDocument();
    expect(screen.getByText("Cancelled Subscriptions")).toBeInTheDocument();
    // Real counts from the mocked backend (appear in stat card and plan breakdown).
    expect(screen.getAllByText("1,112").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Payment provider not connected").length,
    ).toBeGreaterThan(0);
  });
});

describe("Admin analytics page", () => {
  it("renders user metrics and charts, and responds to the date filter", async () => {
    seedAdminData();
    renderPage(<AdminAnalyticsPage />);

    expect(await screen.findByText("Total Registered")).toBeInTheDocument();
    expect(screen.getByText("New Today")).toBeInTheDocument();
    // "Retention Rate" appears in both the stat card and the chart card title.
    expect(screen.getAllByText("Retention Rate").length).toBeGreaterThan(0);
    expect(screen.getByText("42.5%")).toBeInTheDocument();

    // The chart series is requested for the default 30-day range.
    expect(mockActor.adminGetChartSeries).toHaveBeenCalledWith("last30Days");

    // Selecting "Last 7 days" re-requests the chart series for that range.
    const last7 = screen.getByRole("button", { name: /Last 7 days/i });
    await userEvent.click(last7);
    await vi.waitFor(() => {
      expect(mockActor.adminGetChartSeries).toHaveBeenCalledWith("last7Days");
    });
  });
});
