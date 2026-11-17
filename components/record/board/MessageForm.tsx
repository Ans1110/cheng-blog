"use client";

import { cn } from "@/lib/utils";
import { useCreateBoardMessage } from "@/hooks/useBoard";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX = 500;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

/** Composer for a new bubble. Only rendered for the logged-in admin. */
export function MessageForm({ onPosted }: { onPosted?: () => void }) {
  const create = useCreateBoardMessage();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Use JPEG, PNG, WebP or GIF");
    if (file.size > MAX_SIZE) return toast.error("Photo must be under 5MB");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Upload failed");
      setImageUrl(result.data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const canPost = content.trim().length > 0 || !!imageUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    try {
      await create.mutateAsync({ content: content.trim(), imageUrl });
      setContent("");
      setImageUrl(null);
      toast.success("Bubble added");
      onPosted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't add the message");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl opacity-30 bg-[var(--dream-lilac)]"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a message..."
        maxLength={MAX}
        rows={5}
        autoFocus
        aria-label="Message"
        className="relative w-full resize-none bg-transparent leading-relaxed outline-none placeholder:text-muted-foreground/70"
      />
      {imageUrl && (
        <div className="relative w-fit">
          <div className="relative h-32 w-44 overflow-hidden rounded-xl border border-border/50">
            <Image src={imageUrl} alt="Attached photo" fill sizes="176px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <div className="relative flex items-center justify-between gap-3">
        <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} hidden onChange={handleFile} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {imageUrl ? "Change photo" : "Add photo"}
        </button>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs tabular-nums", content.length > MAX - 50 ? "text-amber-500" : "text-muted-foreground")}>
            {content.length}/{MAX}
          </span>
          <button
            type="submit"
            disabled={create.isPending || uploading || !canPost}
            className="btn-dream !px-5 !py-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Post
          </button>
        </div>
      </div>
    </form>
  );
}
