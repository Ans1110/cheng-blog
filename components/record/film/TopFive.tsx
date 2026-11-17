"use client";

import type { FilmReview } from "@/types/film";
import { motion } from "framer-motion";
import { FilmPoster } from "./FilmPoster";
import { StarRating } from "./StarRating";

/** Films hand-picked in admin, in rank order (1 → 5). */
export function pickTopFive(films: FilmReview[]): FilmReview[] {
  return films
    .filter((f): f is FilmReview & { topRank: number } => f.topRank != null)
    .sort((a, b) => a.topRank - b.topRank)
    .slice(0, 5);
}

export function TopFive({ films, onOpen }: { films: FilmReview[]; onOpen: (film: FilmReview) => void }) {
  if (films.length === 0) return null;

  return (
    <section aria-labelledby="top-five-heading" className="mb-14">
      <div className="mb-5 flex items-baseline gap-3">
        <h2 id="top-five-heading" className="font-display italic text-3xl md:text-4xl">
          <span className="text-dream">Top 5</span>
        </h2>
        <span className="eyebrow text-xs">My all-time favourites</span>
      </div>

      {/* Scrolls sideways on small screens, fits in one row on desktop */}
      <ol className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0">
        {films.map((film, i) => (
          <motion.li
            key={film.id}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-44 shrink-0 snap-start md:w-auto"
          >
            <button
              type="button"
              onClick={() => onOpen(film)}
              aria-label={`Number ${film.topRank ?? i + 1}: ${film.title}`}
              className="group relative flex w-full items-end text-left focus-visible:outline-2 focus-visible:outline-[var(--dream-lilac)] rounded-2xl"
            >
              {/* Big outlined rank number peeking out from behind the poster */}
              <span
                aria-hidden
                className="font-display italic select-none leading-none text-[7rem] md:text-[8rem] -mr-6 md:-mr-7 translate-y-3 text-transparent [-webkit-text-stroke:2px_var(--dream-lilac)] opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:[-webkit-text-stroke:2px_var(--dream-pink)]"
              >
                {film.topRank ?? i + 1}
              </span>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="overflow-hidden rounded-2xl shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:-translate-y-1">
                  <FilmPoster
                    film={film}
                    sizes="(min-width: 768px) 15vw, 140px"
                    className="aspect-[2/3] w-full transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{film.title}</p>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                  <StarRating value={film.rating} />
                  <span className="text-muted-foreground">{film.rating.toFixed(1)}</span>
                </span>
              </div>
            </button>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
