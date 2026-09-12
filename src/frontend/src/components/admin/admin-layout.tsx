import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsAdmin } from "@/hooks/useQueries";

/**
 * Admin layout shell. Gates the entire /admin area behind the admin role:
 * non-admin callers are redirected to the normal app and never see admin
 * data or admin navigation. Every admin data operation is additionally
 * validated server-side by the backend.
 */
export function AdminLayout() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const { isAuthenticated, clear } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      void navigate({ to: "/" });
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="bg-background flex min-h-screen items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-sm">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        data-ocid="admin.denied"
        className="bg-background flex min-h-screen items-center justify-center p-6"
      >
        <div className="stat-card flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="stat-icon">
            <ShieldAlert className="size-5" />
          </div>
          <h1 className="font-display text-lg font-semibold">
            Admin access required
          </h1>
          <p className="text-muted-foreground text-sm">
            You do not have permission to view this area. Redirecting to the
            app…
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="bg-card border-b shadow-subtle sticky top-0 z-30 flex h-14 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => clear()}
                data-ocid="admin.sign_out_button"
              >
                <LogOut />
                Sign out
              </Button>
            )}
          </div>
        </header>
        <main className="bg-background flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
