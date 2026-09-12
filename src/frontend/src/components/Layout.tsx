import { Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-card border-b shadow-subtle sticky top-0 z-30 flex h-14 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="bg-background flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
