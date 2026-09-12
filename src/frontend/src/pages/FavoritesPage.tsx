import { Star } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export function FavoritesPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Favorites"
        description="Quick access to the tools and items you've starred."
      />

      <EmptyState
        icon={Star}
        title="No favorites yet"
        description="Star your favorite tools and results to pin them here for quick access."
      />
    </div>
  );
}
