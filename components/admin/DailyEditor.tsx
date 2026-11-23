"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DailyImage, DailyPost } from "@/types/daily";
import { createDailyPostSchema, type CreateDailyPostInput } from "@/utils/validation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

interface DailyEditorProps {
  post?: DailyPost;
  onSave: (data: CreateDailyPostInput) => Promise<void>;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.message || "Upload failed");
  return result.data.url as string;
}

export default function DailyEditor({ post, onSave }: DailyEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [images, setImages] = useState<DailyImage[]>(post?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const valid = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: use JPEG, PNG, WebP or GIF`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: larger than 5MB`);
        return false;
      }
      return true;
    });

    setUploading((n) => n + valid.length);
    // Upload in parallel but append in the order the files were picked.
    const results = await Promise.allSettled(valid.map(uploadImage));
    setUploading((n) => n - valid.length);

    const added: DailyImage[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") added.push({ url: r.value, caption: "" });
      else toast.error(`${valid[i].name}: ${r.reason instanceof Error ? r.reason.message : "upload failed"}`);
    });
    if (added.length) setImages((prev) => [...prev, ...added]);
  };

  const updateCaption = (i: number, caption: string) =>
    setImages((prev) => prev.map((img, j) => (j === i ? { ...img, caption } : img)));

  const move = (i: number, delta: number) =>
    setImages((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const remove = (i: number) => setImages((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createDailyPostSchema.safeParse({ title, content, images });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid post");
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed.data);
      toast.success(post ? "Post updated" : "Post published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="daily-title">Title</Label>
        <Input
          id="daily-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A slow Sunday in Seoul"
          maxLength={255}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Photos</Label>
          <span className="text-sm text-muted-foreground">{images.length}/20</span>
        </div>
        <p className="text-sm text-muted-foreground">
          The caption under each photo shows on the card as people swipe through.
        </p>

        {images.length > 0 && (
          <ul className="space-y-3">
            {images.map((img, i) => (
              <li
                key={img.url + i}
                className="flex gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 text-xs text-white">
                    {i + 1}
                  </span>
                </div>
                <Textarea
                  value={img.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Short text for this photo"
                  maxLength={300}
                  className="min-h-24 flex-1 resize-none"
                />
                <div className="flex flex-col gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(i)}
                    aria-label="Remove photo"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          hidden
          onChange={handleFiles}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading > 0 || images.length >= 20}
        >
          {uploading > 0 ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Uploading {uploading}...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 size-4" /> Add photos
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="daily-content">Story</Label>
        <p className="text-sm text-muted-foreground">
          The long text shown beside the photos when the post opens. Markdown works.
        </p>
        <Textarea
          id="daily-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened that day..."
          className="min-h-64 font-mono text-sm"
        />
      </div>

      <Button type="submit" size="lg" disabled={saving || uploading > 0}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        {post ? "Save changes" : "Publish"}
      </Button>
    </form>
  );
}
