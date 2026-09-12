import { Link, useLocation } from "@tanstack/react-router";
import { FolderKanban, Home, LayoutGrid, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", href: "/", icon: Home },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      data-ocid="mobile_nav"
      className="bg-card/95 border-t backdrop-blur fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch justify-around border-border md:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
            isActive(item.href)
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <item.icon className="size-5" />
          {item.title}
        </Link>
      ))}

      <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            data-ocid="mobile_nav.tools_button"
            className={cn(
              "flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-none text-xs font-medium",
              pathname.startsWith("/tools") ||
                pathname.startsWith("/chat") ||
                pathname.startsWith("/image")
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="size-5" />
            Tools
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-8">
          <SheetHeader>
            <SheetTitle>AI Tools</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 p-4">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.href}
                onClick={() => setToolsOpen(false)}
                className="bg-muted hover:bg-accent flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-colors"
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                    tool.accent,
                  )}
                >
                  <tool.icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{tool.name}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
