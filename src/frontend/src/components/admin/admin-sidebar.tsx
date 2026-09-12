import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Coins,
  CreditCard,
  Gauge,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const adminNav: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: Gauge },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "AI Usage", href: "/admin/ai-usage", icon: BarChart3 },
  { title: "Revenue", href: "/admin/revenue", icon: Wallet },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Costs & Profit", href: "/admin/costs", icon: Coins },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminNavList({ items }: { items: AdminNavItem[] }) {
  const { pathname } = useLocation();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={isActive(item.href)}>
            <Link to={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="bg-gradient-primary flex size-8 items-center justify-center rounded-lg text-white">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-base font-bold">
                    Admin
                  </span>
                  <span className="text-muted-foreground text-xs">
                    AI Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminNavList items={adminNav} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <ArrowLeft />
                <span>Back to app</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
