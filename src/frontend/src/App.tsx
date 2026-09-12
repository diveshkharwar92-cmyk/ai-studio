import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";

import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getToolById } from "@/lib/tools";
import { ChatPage } from "@/pages/ChatPage";
import { ComingSoon } from "@/pages/ComingSoon";
import { Dashboard } from "@/pages/Dashboard";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ImagePage } from "@/pages/ImagePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SubscriptionPage } from "@/pages/SubscriptionPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { AdminAiUsagePage } from "@/pages/admin/AdminAiUsagePage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminCostsPage } from "@/pages/admin/AdminCostsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminRevenuePage } from "@/pages/admin/AdminRevenuePage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminSubscriptionsPage } from "@/pages/admin/AdminSubscriptionsPage";
import { AdminUserDetailPage } from "@/pages/admin/AdminUserDetailPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      <Outlet />
    </ThemeProvider>
  ),
});

// --- Normal user app (wrapped in the shared Layout shell) ---
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: Dashboard,
});

const toolsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/tools",
  component: ToolsPage,
});

const chatRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/chat",
  component: ChatPage,
});

const imageRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/image",
  component: ImagePage,
});

const toolComingSoonRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/tools/$toolId",
  component: ToolComingSoon,
});

const projectsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/projects",
  component: ProjectsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/history",
  component: HistoryPage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/favorites",
  component: FavoritesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const subscriptionRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/subscription",
  component: SubscriptionPage,
});

// --- Admin area (own layout, gated by the admin role) ---
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminDashboardPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: AdminUsersPage,
});

const adminAiUsageRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/ai-usage",
  component: AdminAiUsagePage,
});

const adminRevenueRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/revenue",
  component: AdminRevenuePage,
});

const adminSubscriptionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/subscriptions",
  component: AdminSubscriptionsPage,
});

const adminCostsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/costs",
  component: AdminCostsPage,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/analytics",
  component: AdminAnalyticsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: AdminSettingsPage,
});

const adminUserDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users/$userId",
  component: AdminUserDetailPage,
});

const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    dashboardRoute,
    toolsRoute,
    chatRoute,
    imageRoute,
    toolComingSoonRoute,
    projectsRoute,
    historyRoute,
    favoritesRoute,
    profileRoute,
    settingsRoute,
    subscriptionRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminUsersRoute,
    adminAiUsageRoute,
    adminRevenueRoute,
    adminSubscriptionsRoute,
    adminCostsRoute,
    adminAnalyticsRoute,
    adminSettingsRoute,
    adminUserDetailRoute,
  ]),
]);

function ToolComingSoon() {
  const { toolId } = useParams({ from: toolComingSoonRoute.id });
  const tool = getToolById(toolId);
  return <ComingSoon tool={tool?.name ?? "This tool"} />;
}

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
