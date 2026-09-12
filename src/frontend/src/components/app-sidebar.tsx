import { Link, useLocation } from "@tanstack/react-router";
import {
  FolderKanban,
  History,
  Home,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Sparkles,
  Star,
  User,
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

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "AI Tools", href: "/tools", icon: LayoutGrid },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "History", href: "/history", icon: History },
  { title: "Favorites", href: "/favorites", icon: Star },
];

const accountNav: NavItem[] = [
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
];

function NavList({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-gradient-primary flex size-8 items-center justify-center rounded-lg text-white">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-base font-bold">
                    AI Studio
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Premium AI suite
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={mainNav} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={accountNav} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/subscription">
                <Sparkles />
                <span>Upgrade to Pro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
