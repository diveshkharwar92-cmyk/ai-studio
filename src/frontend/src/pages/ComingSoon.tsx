import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export function ComingSoon({ tool }: { tool: string }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={tool} description="This tool is not available yet." />

      <EmptyState
        icon={Clock}
        title={`${tool} is coming soon`}
        description="AI provider is not configured yet. Add the required API key to enable this feature. We're working on it and it will be available in AI Studio shortly — check back soon."
        action={
          <Button asChild type="button" data-ocid="coming_soon.back_button">
            <Link to="/tools">
              Browse other tools
              <ArrowRight />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
