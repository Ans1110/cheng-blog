"use client";

import { platformLabel } from "@/components/record/ive/VideoCard";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuggestInput } from "@/components/ui/suggest-input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateIveVideo,
  useDeleteIveVideo,
  useIveCover,
  useUpdateIveCover,
  useIveVideos,
  usePreviewIveVideo,
  useUpdateIveVideo,
} from "@/hooks/useIve";
import { iveSectionLabel, type IveVideo, type IveVideoMeta } from "@/types/ive";
import {
  createIveVideoSchema,
  iveCollectionSections,
  iveSections,
  type IveSection,
} from "@/utils/validation";
import { ExternalLink, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";


const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const COVER_MAX_SIZE = 5 * 1024 * 1024;

/** Checks and uploads an image to Cloudinary; returns its URL. */
async function uploadImage(file: File): Promise<string> {
  if (!COVER_TYPES.includes(file.type)) throw new Error("Use JPEG, PNG, WebP or GIF");
  if (file.size > COVER_MAX_SIZE) throw new Error("Image must be under 5MB");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.message || "Upload failed");
  return result.data.url;
}

type Point = { x: number; y: number };
const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Cover image that can be dragged to choose which part shows (CSS object-position).
 * Dragging moves the image under a fixed frame, like repositioning a profile banner.
 */
function DraggableCover({
  src,
  position,
  onChange,
}: {
  src: string;
  position: Point;
  onChange: (p: Point) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const drag = useRef<{ px: number; py: number; start: Point } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, start: position };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!drag.current || !frame || !natural) return;
    const { width: cw, height: ch } = frame.getBoundingClientRect();
    // object-fit: cover scales the image until both sides fill the frame.
    const scale = Math.max(cw / natural.w, ch / natural.h);
    const overflowX = natural.w * scale - cw;
    const overflowY = natural.h * scale - ch;
    const { px, py, start } = drag.current;
    onChange({
      x: overflowX > 0 ? clamp(start.x - ((e.clientX - px) / overflowX) * 100) : start.x,
      y: overflowY > 0 ? clamp(start.y - ((e.clientY - py) / overflowY) * 100) : start.y,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: position.x + step, y: position.y },
      ArrowRight: { x: position.x - step, y: position.y },
      ArrowUp: { x: position.x, y: position.y + step },
      ArrowDown: { x: position.x, y: position.y - step },
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    onChange({ x: clamp(next.x), y: clamp(next.y) });
  };

  return (
    <div
      ref={frameRef}
      role="application"
      tabIndex={0}
      aria-roledescription="draggable image"
      aria-label={`Cover position: ${Math.round(position.x)}% across, ${Math.round(position.y)}% down. Drag, or use the arrow keys.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={onKeyDown}
      className="absolute inset-0 cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src={src}
        alt="Archive cover"
        fill
        sizes="896px"
        draggable={false}
        onLoad={(e) =>
          setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
        }
        className="pointer-events-none object-cover"
        style={{ objectPosition: `${position.x}% ${position.y}%` }}
      />
    </div>
  );
}

/** Banner image for the public archive page, uploaded to Cloudinary. */
function CoverUploader() {
  const { data, isLoading } = useIveCover();
  const updateCover = useUpdateIveCover();
  const [uploading, setUploading] = useState(false);
  // Unsaved position while dragging; null means "show what's saved".
  const [draft, setDraft] = useState<Point | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverUrl = data?.coverUrl;
  const saved = data?.position ?? { x: 50, y: 50 };
  const position = draft ?? saved;
  const dirty = draft !== null && (draft.x !== saved.x || draft.y !== saved.y);
  const busy = uploading || updateCover.isPending;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    setUploading(true);
    try {
      await updateCover.mutateAsync({ coverUrl: await uploadImage(file) });
      setDraft(null);
      toast.success("Cover updated — drag it to choose what shows");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSavePosition = () =>
    updateCover.mutate(
      { position },
      {
        onSuccess: () => {
          setDraft(null);
          toast.success("Cover position saved");
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const handleRemove = () =>
    updateCover.mutate(
      { coverUrl: null },
      {
        onSuccess: () => {
          setDraft(null);
          toast.success("Cover removed");
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <div className="max-w-4xl space-y-3 rounded-lg border border-border/50 p-5 shadow-sm">
      <Label>Cover image</Label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-end">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Desktop</p>
          <div className="relative aspect-[21/9] overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
            {coverUrl ? (
              <DraggableCover src={coverUrl} position={position} onChange={setDraft} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                {isLoading ? "Loading…" : "No cover — a gradient is shown instead"}
              </div>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
          </div>
        </div>
        {coverUrl && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Phone</p>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/40">
              <Image
                src={coverUrl}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
                style={{ objectPosition: `${position.x}% ${position.y}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={COVER_TYPES.join(",")} hidden onChange={handleFile} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          <ImagePlus className="mr-2 size-4" />
          {coverUrl ? "Replace cover" : "Upload cover"}
        </Button>
        {dirty && (
          <>
            <Button type="button" onClick={handleSavePosition} disabled={busy}>
              Save position
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)} disabled={busy}>
              Undo
            </Button>
          </>
        )}
        {coverUrl && !dirty && (
          <Button type="button" variant="ghost" onClick={handleRemove} disabled={busy}>
            <X className="mr-2 size-4" />
            Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Drag the image (or use the arrow keys) to choose which part shows. Wide images work best
        (about 21:9). Max 5MB.
      </p>
    </div>
  );
}

const needsCollection = (s: IveSection) => iveCollectionSections.includes(s);

/** Section select + collection field (only for grouped sections) + recommend switch. */
function PlacementFields({
  idPrefix,
  section,
  setSection,
  collection,
  setCollection,
  recommended,
  setRecommended,
  knownCollections,
}: {
  idPrefix: string;
  section: IveSection;
  setSection: (s: IveSection) => void;
  collection: string;
  setCollection: (c: string) => void;
  recommended: boolean;
  setRecommended: (r: boolean) => void;
  knownCollections: Record<string, string[]>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-section`}>Section</Label>
        <Select value={section} onValueChange={(v) => setSection(v as IveSection)}>
          <SelectTrigger id={`${idPrefix}-section`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {iveSections.map((s) => (
              <SelectItem key={s} value={s}>
                {iveSectionLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-collection`}>Collection</Label>
        <SuggestInput
          id={`${idPrefix}-collection`}
          value={collection}
          onChange={setCollection}
          suggestions={knownCollections[section] ?? []}
          disabled={!needsCollection(section)}
          placeholder={needsCollection(section) ? "e.g. LOVE DIVE stages" : "Not used in this section"}
          maxLength={100}
        />
      </div>
      <label className="flex h-9 items-center gap-2 text-sm">
        <Switch checked={recommended} onCheckedChange={setRecommended} />
        Recommend
      </label>
    </div>
  );
}

/** Title + cover typed in by hand, for when the platform blocks the lookup. */
function ManualDetails({
  title,
  setTitle,
  thumbnailUrl,
  setThumbnailUrl,
  onCancel,
}: {
  title: string;
  setTitle: (t: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (u: string) => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    setUploading(true);
    try {
      setThumbnailUrl(await uploadImage(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Enter the details yourself</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Fetch automatically instead
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted/40 text-xs text-muted-foreground outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={thumbnailUrl ? "Replace cover" : "Upload cover"}
        >
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt="" fill sizes="160px" className="object-cover" />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-1">
              <ImagePlus className="size-4" />
              Upload cover
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-4 animate-spin" />
            </span>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept={COVER_TYPES.join(",")} hidden onChange={handleFile} />
        <div className="space-y-2">
          <Label htmlFor="ive-manual-title">Title</Label>
          <Input
            id="ive-manual-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground">
            Tip: a screenshot of the video works as the cover.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaPreview({ meta }: { meta: IveVideoMeta }) {
  return (
    <div className="flex gap-4 rounded-lg border border-border/60 p-3">
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={meta.thumbnailUrl} alt="" fill sizes="160px" className="object-cover" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="line-clamp-2 font-medium">{meta.title}</p>
        <p className="text-sm text-muted-foreground">
          {platformLabel[meta.platform]}
          {meta.author && ` · ${meta.author}`}
        </p>
      </div>
    </div>
  );
}

export default function AdminIvePage() {
  const { data: videos, isLoading } = useIveVideos();
  const preview = usePreviewIveVideo();
  const createVideo = useCreateIveVideo();
  const updateVideo = useUpdateIveVideo();
  const deleteVideo = useDeleteIveVideo();

  const [url, setUrl] = useState("");
  const [section, setSection] = useState<IveSection>("mv");
  const [collection, setCollection] = useState("");
  const [recommended, setRecommended] = useState(false);
  // Shown after a lookup fails (e.g. Bilibili's 412), or when chosen by hand.
  const [manual, setManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualThumb, setManualThumb] = useState("");

  const [editing, setEditing] = useState<IveVideo | null>(null);
  const [editSection, setEditSection] = useState<IveSection>("mv");
  const [editCollection, setEditCollection] = useState("");
  const [editRecommended, setEditRecommended] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const knownCollections = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const v of videos ?? []) {
      if (!v.collection) continue;
      const list = (out[v.section] ??= []);
      if (!list.includes(v.collection)) list.push(v.collection);
    }
    return out;
  }, [videos]);

  const handlePreview = () => {
    if (!url.trim()) return;
    preview.mutate(url.trim(), {
      onSuccess: () => setManual(false),
      onError: (e) => {
        toast.error(e.message);
        setManual(true);
      },
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createIveVideoSchema.safeParse({
      url: url.trim(),
      section,
      collection: needsCollection(section) ? collection : null,
      recommended,
      ...(manual && { title: manualTitle.trim() || undefined, thumbnailUrl: manualThumb || undefined }),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message || "Invalid video");
    try {
      await createVideo.mutateAsync(parsed.data);
      toast.success("Added to the archive");
      setUrl("");
      preview.reset();
      setManual(false);
      setManualTitle("");
      setManualThumb("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add video");
      // A failed lookup means the site won't share details: let them be typed in.
      if (!manual) setManual(true);
    }
  };

  const openEdit = (v: IveVideo) => {
    setEditing(v);
    setEditSection(v.section);
    setEditCollection(v.collection ?? "");
    setEditRecommended(v.recommended);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await updateVideo.mutateAsync({
        id: editing.id,
        data: {
          section: editSection,
          collection: needsCollection(editSection) ? editCollection : null,
          recommended: editRecommended,
        },
      });
      setEditing(null);
      toast.success("Video updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update video");
    }
  };

  const toggleRecommended = (v: IveVideo, value: boolean) =>
    updateVideo.mutate(
      { id: v.id, data: { recommended: value } },
      { onError: (e) => toast.error(e.message) },
    );

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteVideo.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    }
  };

  // Drop a stale preview once the link changes.
  const previewMatches = preview.data && preview.variables === url.trim();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          IVE Archive
        </h1>
        <p className="text-lg text-muted-foreground">
          Videos for Record → K-pop → IVE Archive. Paste a YouTube or Bilibili link; the title and
          cover are fetched for you. If the site blocks that, you can type them in instead.
        </p>
      </div>

      <CoverUploader />

      <form onSubmit={handleAdd} className="max-w-4xl space-y-4 rounded-lg border border-border/50 p-5 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="ive-url">Video link</Label>
          <div className="flex gap-2">
            <Input
              id="ive-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=… or https://www.bilibili.com/video/BV…"
              maxLength={500}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!url.trim() || preview.isPending}
            >
              {preview.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Search className="mr-2 size-4" />
              )}
              Preview
            </Button>
          </div>
        </div>

        {manual ? (
          <ManualDetails
            title={manualTitle}
            setTitle={setManualTitle}
            thumbnailUrl={manualThumb}
            setThumbnailUrl={setManualThumb}
            onCancel={() => setManual(false)}
          />
        ) : (
          previewMatches && preview.data && <MetaPreview meta={preview.data} />
        )}

        <PlacementFields
          idPrefix="ive-new"
          section={section}
          setSection={setSection}
          collection={collection}
          setCollection={setCollection}
          recommended={recommended}
          setRecommended={setRecommended}
          knownCollections={knownCollections}
        />

        <Button type="submit" disabled={!url.trim() || createVideo.isPending}>
          {createVideo.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Add video
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading videos...</p>
        </div>
      ) : !videos || videos.length === 0 ? (
        <p className="py-16 text-center text-lg text-muted-foreground">No videos yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/50 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Recommend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="relative aspect-video w-24 overflow-hidden rounded bg-muted">
                      <Image src={v.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="line-clamp-2 font-medium">{v.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {platformLabel[v.platform]}
                      {v.author && ` · ${v.author}`}
                    </p>
                  </TableCell>
                  <TableCell>{iveSectionLabel[v.section]}</TableCell>
                  <TableCell>{v.collection ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <Switch
                      checked={v.recommended}
                      onCheckedChange={(value) => toggleRecommended(v, value)}
                      aria-label="Recommend"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={v.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Open video">
                          <ExternalLink className="size-4" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(v)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(v.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription className="line-clamp-2">{editing?.title}</DialogDescription>
          </DialogHeader>
          <PlacementFields
            idPrefix="ive-edit"
            section={editSection}
            setSection={setEditSection}
            collection={editCollection}
            setCollection={setEditCollection}
            recommended={editRecommended}
            setRecommended={setEditRecommended}
            knownCollections={knownCollections}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateVideo.isPending}>
              {updateVideo.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Video"
        description="Remove this video from the archive? This can't be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
