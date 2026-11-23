"use client";

import { kindLabel } from "@/components/record/film/FilmCard";
import { StarRating } from "@/components/record/film/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FilmKind, FilmReview } from "@/types/film";
import {
  createFilmReviewSchema,
  filmKinds,
  type CreateFilmReviewInput,
} from "@/utils/validation";
import { format } from "date-fns";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;
const RATINGS = Array.from({ length: 11 }, (_, i) => i / 2); // 0, 0.5 … 5


interface FilmEditorProps {
  film?: FilmReview;
  onSave: (data: CreateFilmReviewInput) => Promise<void>;
}

export default function FilmEditor({ film, onSave }: FilmEditorProps) {
  const [title, setTitle] = useState(film?.title ?? "");
  const [originalTitle, setOriginalTitle] = useState(film?.originalTitle ?? "");
  const [year, setYear] = useState(String(film?.year ?? new Date().getFullYear()));
  const [kind, setKind] = useState<FilmKind>(film?.kind ?? "movie");
  const [rating, setRating] = useState(film?.rating ?? 4);
  const [genres, setGenres] = useState<string[]>(film?.genres ?? []);
  const [genreInput, setGenreInput] = useState("");
  const [posterUrl, setPosterUrl] = useState(film?.posterUrl ?? "");
  const [verdict, setVerdict] = useState(film?.verdict ?? "");
  const [review, setReview] = useState(film?.review ?? "");
  const [topRank, setTopRank] = useState<number | null>(film?.topRank ?? null);
  const [watchedAt, setWatchedAt] = useState(film?.watchedAt ?? format(new Date(), "yyyy-MM-dd"));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGenre = () => {
    const g = genreInput.trim();
    if (!g) return;
    if (!genres.some((x) => x.toLowerCase() === g.toLowerCase())) setGenres([...genres, g]);
    setGenreInput("");
  };

  const handlePoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Use JPEG, PNG, WebP or GIF");
    if (file.size > MAX_SIZE) return toast.error("Poster must be under 5MB");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Upload failed");
      setPosterUrl(result.data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createFilmReviewSchema.safeParse({
      title,
      originalTitle: originalTitle.trim() || null,
      year: Number(year),
      kind,
      rating,
      genres,
      posterUrl: posterUrl || null,
      verdict,
      review,
      watchedAt,
      topRank,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid review");
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed.data);
      toast.success(film ? "Review updated" : "Review published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] max-w-5xl">
      {/* Poster */}
      <div className="space-y-3">
        <Label>Poster</Label>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
          {posterUrl ? (
            <>
              <Image src={posterUrl} alt="Poster" fill sizes="220px" className="object-cover" />
              <button
                type="button"
                onClick={() => setPosterUrl("")}
                aria-label="Remove poster"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
              No poster — a gradient with the title is shown instead
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} hidden onChange={handlePoster} />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ImagePlus className="mr-2 size-4" />}
          {posterUrl ? "Replace poster" : "Upload poster"}
        </Button>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="film-title">Title</Label>
            <Input id="film-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="film-original">Original title (optional)</Label>
            <Input
              id="film-original"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              maxLength={255}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="film-kind">Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as FilmKind)}>
              <SelectTrigger id="film-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filmKinds.map((k) => (
                  <SelectItem key={k} value={k}>
                    {kindLabel[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="film-year">Release year</Label>
            <Input id="film-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="film-watched">Watched on</Label>
            <DatePicker id="film-watched" value={watchedAt} onChange={setWatchedAt} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="film-rating">Rating</Label>
            <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
              <SelectTrigger id="film-rating" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATINGS.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r.toFixed(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StarRating value={rating} className="text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="film-top-rank">Top 5</Label>
          <Select
            value={topRank ? String(topRank) : "none"}
            onValueChange={(v) => setTopRank(v === "none" ? null : Number(v))}
          >
            <SelectTrigger id="film-top-rank" className="w-full sm:max-w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not in Top 5</SelectItem>
              {[1, 2, 3, 4, 5].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  #{r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Picking a rank that&rsquo;s taken moves the other film out of the Top 5.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="film-genre">Genres</Label>
          <div className="flex gap-2">
            <Input
              id="film-genre"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addGenre();
                }
              }}
              placeholder="Type a genre and press Enter"
              maxLength={50}
            />
            <Button type="button" variant="outline" onClick={addGenre}>
              Add
            </Button>
          </div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {genres.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 py-0.5 pl-3 pr-1 text-sm"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => setGenres(genres.filter((x) => x !== g))}
                    aria-label={`Remove ${g}`}
                    className="rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="film-verdict">One-line verdict</Label>
          <Input
            id="film-verdict"
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            placeholder="Shown on the card"
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="film-review">Full review</Label>
          <p className="text-sm text-muted-foreground">Shown in the popup. Markdown works.</p>
          <Textarea
            id="film-review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-72 font-mono text-sm"
          />
        </div>

        <Button type="submit" size="lg" disabled={saving || uploading}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          {film ? "Save changes" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
