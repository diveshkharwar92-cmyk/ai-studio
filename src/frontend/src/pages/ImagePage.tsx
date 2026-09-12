import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Image as ImageIcon,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createActor } from "@/backend";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const STYLES = [
  "Photorealistic",
  "Cinematic",
  "Anime",
  "Digital Art",
  "3D Render",
  "Watercolor",
];
const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const QUALITIES = ["Standard", "High", "Ultra"];
const COUNTS = [1, 2, 3, 4];

interface GalleryItem {
  key: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  quality: string;
  saved: boolean;
  createdAt: number;
}

export function ImagePage() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [count, setCount] = useState(1);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [providerNotConfigured, setProviderNotConfigured] = useState(false);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const { data: savedFiles, isLoading: filesLoading } = useQuery({
    queryKey: ["saved-files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFiles();
    },
    enabled: !!actor && !isFetching,
  });

  const generateMutation = useMutation({
    mutationFn: async (fullPrompt: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const results = await Promise.all(
        Array.from({ length: count }, () =>
          actor.generateImage(0n, fullPrompt),
        ),
      );
      return results;
    },
    onSuccess: (results) => {
      if (
        results.some((result) => result.__kind__ === "providerNotConfigured")
      ) {
        setProviderNotConfigured(true);
        return;
      }
      setProviderNotConfigured(false);
      const now = Date.now();
      const newItems: GalleryItem[] = results
        .filter(
          (result): result is Extract<typeof result, { __kind__: "ok" }> =>
            result.__kind__ === "ok",
        )
        .map((_, index) => ({
          key: `gen-${now}-${index}`,
          prompt,
          style,
          aspectRatio,
          quality,
          saved: false,
          createdAt: now + index,
        }));
      setGallery((previous) => [...newItems, ...previous]);
      toast.success(
        `Generated ${newItems.length} image${newItems.length === 1 ? "" : "s"}`,
      );
    },
    onError: () => {
      toast.error("Something went wrong while generating. Please try again.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: GalleryItem) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveFile(null, {
        name: item.prompt,
        mimeType: "image/png",
        sizeBytes: 0n,
      });
    },
    onSuccess: (result, item) => {
      if (result.__kind__ === "err") {
        toast.error("Could not save this image.");
        return;
      }
      setGallery((previous) =>
        previous.map((entry) =>
          entry.key === item.key ? { ...entry, saved: true } : entry,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ["saved-files"] });
      toast.success("Image saved to your files.");
    },
    onError: () => {
      toast.error("Could not save this image.");
    },
  });

  const handleGenerate = () => {
    const fullPrompt = `${prompt}, ${style} style, ${aspectRatio} aspect ratio, ${quality} quality`;
    generateMutation.mutate(fullPrompt);
  };

  const handleDelete = (key: string) => {
    setGallery((previous) => previous.filter((entry) => entry.key !== key));
  };

  const handleShare = async (item: GalleryItem) => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      toast.success("Prompt copied to clipboard.");
    } catch {
      toast.error("Could not copy the prompt.");
    }
  };

  const savedKeys = new Set(
    gallery.filter((entry) => entry.saved).map((entry) => entry.prompt),
  );
  const savedItems: GalleryItem[] = (savedFiles ?? [])
    .filter((file) => !savedKeys.has(file.name))
    .map((file) => ({
      key: `saved-${file.id}`,
      prompt: file.name,
      style: "",
      aspectRatio: "",
      quality: "",
      saved: true,
      createdAt: Number(file.createdAt / 1_000_000n),
    }));

  const allItems = [...gallery, ...savedItems];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Text to Image"
        description="Turn written prompts into stunning, high-quality images."
      />

      <Card className="shadow-subtle">
        <CardContent className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Prompt</Label>
            <Textarea
              id="image-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the image you want to create…"
              rows={3}
              data-ocid="image.prompt_input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger
                  className="w-full"
                  data-ocid="image.style_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aspect ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger
                  className="w-full"
                  data-ocid="image.aspect_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger
                  className="w-full"
                  data-ocid="image.quality_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <Select
                value={String(count)}
                onValueChange={(value) => setCount(Number(value))}
              >
                <SelectTrigger
                  className="w-full"
                  data-ocid="image.count_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">
              Be descriptive for best results
            </span>
            <Button
              type="button"
              disabled={!prompt.trim() || generateMutation.isPending}
              onClick={handleGenerate}
              data-ocid="image.generate_button"
            >
              {generateMutation.isPending ? (
                <Sparkles className="animate-spin" />
              ) : (
                <Wand2 />
              )}
              {generateMutation.isPending ? "Generating…" : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {providerNotConfigured && (
        <div
          className="bg-accent/10 text-accent-foreground flex items-start gap-3 rounded-lg border border-accent/20 px-4 py-3 text-sm"
          data-ocid="image.provider_not_configured"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">AI provider is not configured yet.</p>
            <p className="text-accent-foreground/80">
              Add the required API key to enable this feature.
            </p>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your images</h2>
          <span className="text-muted-foreground text-xs">
            {allItems.length} image{allItems.length === 1 ? "" : "s"}
          </span>
        </div>

        {filesLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => `skeleton-${index}`).map(
              (id) => (
                <Skeleton
                  key={id}
                  className="aspect-square w-full rounded-xl"
                />
              ),
            )}
          </div>
        ) : allItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center"
            data-ocid="image.empty_state"
          >
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <ImageIcon className="text-muted-foreground size-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">
              No images yet
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              Describe what you want to create and hit Generate. Your images
              will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {allItems.map((item) => {
              const position = allItems.indexOf(item) + 1;
              return (
                <Card key={item.key} className="overflow-hidden shadow-subtle">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="group relative block aspect-square w-full overflow-hidden"
                    data-ocid={`image.item.${position}`}
                    aria-label={`Preview ${item.prompt}`}
                  >
                    <div className="bg-gradient-primary flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <ImageIcon className="text-primary-foreground/80 size-8" />
                      <span className="text-primary-foreground line-clamp-3 text-xs font-medium">
                        {item.prompt}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="size-6 text-white" />
                    </div>
                  </button>
                  <CardContent className="flex flex-col gap-3 p-3">
                    <p className="text-muted-foreground line-clamp-2 min-h-8 text-xs">
                      {item.prompt}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setPreviewItem(item)}
                        aria-label="Preview image"
                        data-ocid={`image.preview_button.${position}`}
                      >
                        <Eye />
                      </Button>
                      {!item.saved ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={saveMutation.isPending}
                          onClick={() => saveMutation.mutate(item)}
                          aria-label="Save image"
                          data-ocid={`image.save_button.${position}`}
                        >
                          <Save />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1 px-2 text-xs">
                          <Save className="size-3.5" /> Saved
                        </span>
                      )}
                      {!item.saved && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.key)}
                          aria-label="Delete image"
                          data-ocid={`image.delete_button.${position}`}
                        >
                          <Trash2 />
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleShare(item)}
                        aria-label="Share image"
                        data-ocid={`image.share_button.${position}`}
                      >
                        <Share2 />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="sm:max-w-lg" data-ocid="image.preview_dialog">
          <DialogHeader>
            <DialogTitle>Image preview</DialogTitle>
            <DialogDescription>
              Your generated image and its settings.
            </DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-primary flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg p-6 text-center">
                <ImageIcon className="text-primary-foreground/80 size-12" />
                <p className="text-primary-foreground text-sm font-medium">
                  {previewItem.prompt}
                </p>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {previewItem.style && <span>Style: {previewItem.style}</span>}
                {previewItem.aspectRatio && (
                  <span>Aspect: {previewItem.aspectRatio}</span>
                )}
                {previewItem.quality && (
                  <span>Quality: {previewItem.quality}</span>
                )}
                {previewItem.saved && (
                  <span className="text-success">Saved</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
