import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Image,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { ToolCard } from "@/components/tool-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  timestampToDate,
  useConversations,
  useDeleteProject,
  useFiles,
  useProjects,
  useRenameProject,
} from "@/hooks/useQueries";
import { tools } from "@/lib/tools";

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

export function Dashboard() {
  const [query, setQuery] = useState("");

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: files, isLoading: filesLoading } = useFiles();
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations();
  const renameProject = useRenameProject();
  const deleteProject = useDeleteProject();

  const [renameTarget, setRenameTarget] = useState<{
    id: bigint;
    name: string;
  } | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: bigint;
    name: string;
  } | null>(null);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q),
    );
  }, [query]);

  const quickAccess = tools.filter((tool) => tool.status === "available");

  const recentProjects = useMemo(
    () => (projects ?? []).slice(0, 3),
    [projects],
  );
  const recentFiles = useMemo(() => (files ?? []).slice(0, 3), [files]);
  const recentConversations = useMemo(
    () => (conversations ?? []).slice(0, 3),
    [conversations],
  );

  const handleRename = () => {
    if (!renameTarget) return;
    const name = renameName.trim();
    if (!name) return;
    renameProject.mutate(
      { projectId: renameTarget.id, name },
      {
        onSuccess: () => {
          setRenameTarget(null);
          setRenameName("");
          toast.success("Project renamed");
        },
        onError: () => {
          toast.error("Could not rename project");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProject.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Project deleted");
      },
      onError: () => {
        toast.error("Could not delete project");
      },
    });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-subtle relative overflow-hidden rounded-2xl border p-8 sm:p-12"
      >
        <div className="relative z-10 flex max-w-2xl flex-col gap-4">
          <span className="bg-primary/10 text-primary inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            Premium AI Studio
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back to{" "}
            <span className="text-gradient-primary">AI Studio</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            A curated suite of 13 intelligent tools to create, analyze, and
            accelerate your work — all in one place.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              type="button"
              data-ocid="dashboard.explore_button"
            >
              <Link to="/tools">
                Explore AI tools
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              type="button"
              data-ocid="dashboard.chat_button"
            >
              <Link to="/chat">Start a conversation</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold">AI Tools</h2>
            <p className="text-muted-foreground text-sm">
              Pick a tool to get started
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="pl-9"
              data-ocid="dashboard.search_input"
              aria-label="Search tools"
            />
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div
            className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border px-6 py-16 text-center"
            data-ocid="dashboard.empty_state"
          >
            <Search className="text-muted-foreground size-8" />
            <p className="font-display text-lg font-semibold">
              No tools match "{query}"
            </p>
            <p className="text-muted-foreground text-sm">
              Try a different keyword or clear your search.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
              data-ocid="dashboard.clear_search_button"
            >
              Clear search
            </Button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold">Quick access</h2>
          <p className="text-muted-foreground text-sm">
            Jump straight into your available tools
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickAccess.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.href}
                className="transition-smooth group border-border bg-card hover:shadow-elevated flex items-center gap-4 rounded-2xl border p-5"
                data-ocid={`dashboard.quick_access.${tool.id}`}
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${tool.accent}`}
                >
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display truncate text-base font-semibold">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground truncate text-sm">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-smooth" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold">
              Recent activity
            </h2>
            <p className="text-muted-foreground text-sm">
              Your latest projects, files, and conversations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              data-ocid="dashboard.view_projects_button"
            >
              <Link to="/projects">View projects</Link>
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              data-ocid="dashboard.view_history_button"
            >
              <Link to="/history">View history</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="text-primary size-4" />
              <h3 className="font-display text-base font-semibold">
                Recent projects
              </h3>
            </div>
            {projectsLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : recentProjects.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentProjects.map((project, index) => (
                  <Card key={project.id.toString()}>
                    <CardContent
                      className="flex items-center gap-4 p-4"
                      data-ocid={`dashboard.project.${index + 1}`}
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <FolderKanban className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-sm font-semibold">
                          {project.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Updated {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${project.name}`}
                            data-ocid={`dashboard.project_menu.${index + 1}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setRenameTarget({
                                id: project.id,
                                name: project.name,
                              });
                              setRenameName(project.name);
                            }}
                            data-ocid={`dashboard.project_rename.${index + 1}`}
                          >
                            <Pencil />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() =>
                              setDeleteTarget({
                                id: project.id,
                                name: project.name,
                              })
                            }
                            data-ocid={`dashboard.project_delete.${index + 1}`}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create a project to keep your AI work organized."
                className="py-10"
                action={
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="dashboard.project_empty_button"
                  >
                    <Link to="/projects">Create a project</Link>
                  </Button>
                }
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image className="text-primary size-4" />
              <h3 className="font-display text-base font-semibold">
                Recent generations
              </h3>
            </div>
            <EmptyState
              icon={Image}
              title="No generations yet"
              description="Your generated images and results will appear here as you use the tools."
              className="py-10"
              action={
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid="dashboard.generations_empty_button"
                >
                  <Link to="/image">Generate an image</Link>
                </Button>
              }
            />
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="text-primary size-4" />
              <h3 className="font-display text-base font-semibold">
                Saved files
              </h3>
            </div>
            {filesLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentFiles.map((file, index) => (
                  <Card key={file.id.toString()}>
                    <CardContent
                      className="flex items-center gap-4 p-4"
                      data-ocid={`dashboard.file.${index + 1}`}
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
                      <Badge variant="secondary">No delete</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No saved files"
                description="Files you save from your AI work will show up here."
                className="py-10"
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-primary size-4" />
              <h3 className="font-display text-base font-semibold">
                Chat history
              </h3>
            </div>
            {conversationsLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentConversations.map((conversation, index) => (
                  <Card key={conversation.id.toString()}>
                    <CardContent
                      className="flex items-center gap-4 p-4"
                      data-ocid={`dashboard.conversation.${index + 1}`}
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
                      <Badge variant="secondary">No delete</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Start a conversation and your chat history will appear here."
                className="py-10"
                action={
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="dashboard.conversation_empty_button"
                  >
                    <Link to="/chat">Start a conversation</Link>
                  </Button>
                }
              />
            )}
          </section>
        </div>
      </section>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent data-ocid="dashboard.rename_modal">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Update the name of this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="dashboard-rename-name">Project name</Label>
            <Input
              id="dashboard-rename-name"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              placeholder="Project name"
              autoFocus
              data-ocid="dashboard.rename_name_input"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
              data-ocid="dashboard.rename_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!renameName.trim() || renameProject.isPending}
              onClick={handleRename}
              data-ocid="dashboard.rename_submit_button"
            >
              {renameProject.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="dashboard.delete_modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{deleteTarget?.name}” and its
              contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="dashboard.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              data-ocid="dashboard.delete_confirm_button"
            >
              {deleteProject.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
