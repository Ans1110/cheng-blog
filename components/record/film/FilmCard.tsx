"use client";

import type { FilmReview } from "@/types/film";
import { FilmPoster } from "./FilmPoster";
import { StarRating } from "./StarRating";

export const kindLabel: Record<FilmReview["kind"], string> = {
  movie: "Movie",
  series: "Series",
  anime: "Anime",
  documentary: "Documentary",
};

export function FilmCard({ film, onOpen }: { film: FilmReview; onOpen: (film: FilmReview) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(film)}
      aria-label={`Read review of ${film.title}`}
      className="glass group flex h-full w-full flex-col overflow-hidden rounded-3xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--dream-lilac),0_20px_40px_-16px_var(--dream-lilac)] focus-visible:outline-2 focus-visible:outline-[var(--dream-lilac)]"
    >
      <div className="relative">
        <FilmPoster
          film={film}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="aspect-[2/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {kindLabel[film.kind]}
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-sm text-amber-300 backdrop-blur-sm">
          <StarRating value={film.rating} />
          <span className="text-xs font-semibold text-white">{film.rating.toFixed(1)}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display italic text-lg leading-tight line-clamp-1">{film.title}</h2>
          <span className="eyebrow shrink-0 text-xs">{film.year}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{film.verdict}</p>
      </div>
    </button>
  );
}
