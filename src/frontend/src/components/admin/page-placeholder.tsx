import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

/**
 * Temporary placeholder body for admin pages. Page tasks replace these with
 * real content; this keeps the admin routes functional and the build green.
 */
export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
}: PagePlaceholderProps) {
  return (
    <div data-ocid="admin.page_placeholder" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <div className="stat-card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="stat-icon">
          <Icon className="size-5" />
        </div>
        <p className="text-muted-foreground text-sm">
          This section is being built.
        </p>
      </div>
    </div>
  );
}
