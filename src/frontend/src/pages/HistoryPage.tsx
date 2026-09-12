import { FileText, History, MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  timestampToDate,
  useConversations,
  useFiles,
} from "@/hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSize(sizeBytes: bigint): string {
  const bytes = Number(sizeBytes);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HistoryPage() {
  const { data: files, isLoading: filesLoading } = useFiles();
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations();

  const loading = filesLoading || conversationsLoading;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="History"
        description="Review your past AI activity and results."
      />

      {loading ? (
        <div className="flex flex-col gap-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      ) : files &&
        files.length === 0 &&
        conversations &&
        conversations.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Your past conversations, generations, and edits will appear here as you use AI Studio."
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4" />
              <h2 className="font-display text-lg font-semibold">
                Saved files
              </h2>
            </div>
            {files && files.length > 0 ? (
              <div className="flex flex-col gap-3">
                {files.map((file, index) => (
                  <Card key={file.id.toString()}>
                    <CardContent
                      className="flex items-center gap-4 p-4"
                      data-ocid={`history.file.${index + 1}`}
                    >
                      <div className="bg-accent/10 text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-sm font-semibold">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatSize(file.sizeBytes)} ·{" "}
                          {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                No saved files yet.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-muted-foreground size-4" />
              <h2 className="font-display text-lg font-semibold">
                Conversations
              </h2>
            </div>
            {conversations && conversations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {conversations.map((conversation, index) => (
                  <Card key={conversation.id.toString()}>
                    <CardContent
                      className="flex items-center gap-4 p-4"
                      data-ocid={`history.conversation.${index + 1}`}
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <MessageSquare className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-sm font-semibold">
                          {conversation.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(conversation.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                No conversations yet.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
