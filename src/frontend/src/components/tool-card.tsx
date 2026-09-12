import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const isAvailable = tool.status === "available";

  return (
    <Card className="transition-smooth group hover:shadow-elevated overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-6">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            tool.accent,
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold">
              {tool.name}
            </h3>
            {!isAvailable && (
              <Badge variant="secondary">
                <Clock />
                Soon
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {tool.description}
          </p>
        </div>
        <Button
          asChild
          variant={isAvailable ? "default" : "outline"}
          className="mt-auto w-full"
          type="button"
          data-ocid={`tool.${tool.id}.button`}
        >
          <Link to={tool.href}>
            {isAvailable ? "Open tool" : "Coming soon"}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
