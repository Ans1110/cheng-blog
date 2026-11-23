"use client";

import { MarkdownRenderer } from "@/components/markdown/MarkDownRenderer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { FilmReview } from "@/types/film";
import { format } from "date-fns";
import { kindLabel } from "./FilmCard";
import { FilmPoster } from "./FilmPoster";
import { StarRating } from "./StarRating";

export function FilmModal({ film, onClose }: { film: FilmReview | null; onClose: () => void }) {
  return (
    <Dialog open={!!film} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass gap-0 p-0 overflow-hidden rounded-3xl sm:max-w-4xl max-h-[90vh] grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {film && (
          <>
            {/* Left: poster */}
            <FilmPoster
              film={film}
              sizes="(min-width: 768px) 35vw, 100vw"
              className="aspect-[2/3] max-h-[40vh] md:max-h-none w-full"
            />

            {/* Right: review */}
            <div className="flex min-h-0 flex-col overflow-y-auto p-6 md:p-8 max-h-[50vh] md:max-h-[90vh]">
              <p className="eyebrow text-xs">
                {kindLabel[film.kind]} · {film.year}
              </p>
              <DialogTitle className="font-display italic text-3xl md:text-4xl leading-tight mt-2 pr-6">
                <span className="text-dream">{film.title}</span>
              </DialogTitle>
              {film.originalTitle && (
                <p className="mt-1 text-sm text-muted-foreground">{film.originalTitle}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-lg text-amber-400">
                  <StarRating value={film.rating} />
                  <span className="text-sm font-semibold text-foreground">{film.rating.toFixed(1)} / 5</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Watched {format(new Date(film.watchedAt), "MMM d, yyyy")}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {film.genres.map((g) => (
                  <span key={g} className="pill rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {g}
                  </span>
                ))}
              </div>

              <DialogDescription className="mt-5 font-display italic text-lg leading-snug text-foreground/90">
                &ldquo;{film.verdict}&rdquo;
              </DialogDescription>

              <div className="mt-5 border-t border-border/50 pt-5">
                <MarkdownRenderer content={film.review} className="prose-sm md:prose-base" />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
