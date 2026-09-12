import {
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
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
  useCreateProject,
  useDeleteProject,
  useProjects,
  useRenameProject,
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

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const renameProject = useRenameProject();
  const deleteProject = useDeleteProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [renameTarget, setRenameTarget] = useState<{
    id: bigint;
    name: string;
  } | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: bigint;
    name: string;
  } | null>(null);

  const handleCreate = () => {
    const name = createName.trim();
    if (!name) return;
    createProject.mutate(name, {
      onSuccess: () => {
        setCreateName("");
        setCreateOpen(false);
        toast.success("Project created");
      },
      onError: () => {
        toast.error("Could not create project");
      },
    });
  };

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
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Projects"
        description="Organize your AI work into projects."
      >
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          data-ocid="projects.create_button"
        >
          <Plus />
          New project
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Card
              key={project.id.toString()}
              className="group transition-smooth hover:shadow-elevated"
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
                    <FolderKanban className="size-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions for ${project.name}`}
                        data-ocid={`projects.menu_button.${index + 1}`}
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
                        data-ocid={`projects.rename_item.${index + 1}`}
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
                        data-ocid={`projects.delete_item.${index + 1}`}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="font-display truncate text-base font-semibold">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to keep your AI generations, files, and conversations organized in one place."
          action={
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              data-ocid="projects.empty_create_button"
            >
              <Plus />
              Create a project
            </Button>
          }
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-ocid="projects.create_modal">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Give your project a name to start organizing your AI work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="e.g. Brand refresh"
              autoFocus
              data-ocid="projects.create_name_input"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="projects.create_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!createName.trim() || createProject.isPending}
              onClick={handleCreate}
              data-ocid="projects.create_submit_button"
            >
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent data-ocid="projects.rename_modal">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Update the name of this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-name">Project name</Label>
            <Input
              id="rename-name"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              placeholder="Project name"
              autoFocus
              data-ocid="projects.rename_name_input"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
              data-ocid="projects.rename_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!renameName.trim() || renameProject.isPending}
              onClick={handleRename}
              data-ocid="projects.rename_submit_button"
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
        <AlertDialogContent data-ocid="projects.delete_modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{deleteTarget?.name}” and its
              contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="projects.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              data-ocid="projects.delete_confirm_button"
            >
              {deleteProject.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
