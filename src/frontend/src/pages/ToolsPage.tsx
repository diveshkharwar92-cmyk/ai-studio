import { PageHeader } from "@/components/page-header";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/lib/tools";

export function ToolsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="AI Tools"
        description="Choose from 13 tools to start creating, analyzing, and accelerating your work."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
