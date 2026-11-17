"use client";

import { PageHeader, SearchField, TagChip } from "@/components/dream/PageParts";
import { FilmCard, kindLabel } from "@/components/record/film/FilmCard";
import { FilmModal } from "@/components/record/film/FilmModal";
import { pickTopFive, TopFive } from "@/components/record/film/TopFive";
import { useFilmReviews } from "@/hooks/useFilms";
import type { FilmKind, FilmReview } from "@/types/film";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "recent" | "rating" | "year";

const sortLabels: Record<SortKey, string> = {
  recent: "Recently watched",
  rating: "Highest rated",
  year: "Release year",
};

const kinds = Object.keys(kindLabel) as FilmKind[];

export default function FilmReviewPage() {
  const { data, isLoading, error } = useFilmReviews();
  const films = useMemo(() => data ?? [], [data]);

  const [kind, setKind] = useState<FilmKind | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [open, setOpen] = useState<FilmReview | null>(null);

  const topFive = useMemo(() => pickTopFive(films), [films]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = films.filter(
      (f) =>
        (!kind || f.kind === kind) &&
        (!q ||
          f.title.toLowerCase().includes(q) ||
          f.originalTitle?.toLowerCase().includes(q) ||
          f.genres.some((g) => g.toLowerCase().includes(q))),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "year") return b.year - a.year;
      return b.watchedAt.localeCompare(a.watchedAt);
    });
  }, [films, kind, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Film Review" meta={isLoading ? "\u00a0" : `${films.length} watched and rated`} />

      <TopFive films={topFive} onOpen={setOpen} />

      <div className="mb-10 flex flex-col gap-4">
        <SearchField
          id="film-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by title or genre..."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <TagChip label="All" active={!kind} onClick={() => setKind(null)} />
            {kinds.map((k) => (
              <TagChip key={k} label={kindLabel[k]} active={kind === k} onClick={() => setKind(k)} />
            ))}
          </div>
          <label className="pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent outline-none"
            >
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabels[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-20 text-center text-muted-foreground">{error.message}</p>
      ) : films.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No reviews yet.</p>
      ) : shown.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No reviews match that.</p>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((film, i) => (
              <motion.div
                key={film.id}
                layout
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <FilmCard film={film} onOpen={setOpen} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <FilmModal film={open} onClose={() => setOpen(null)} />
    </div>
  );
}
