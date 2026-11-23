import { cn } from "@/lib/utils";
import type { FilmReview } from "@/types/film";
import { Film } from "lucide-react";
import Image from "next/image";

const gradients = [
  "linear-gradient(150deg,var(--dream-pink),var(--dream-lilac) 55%,var(--dream-blue))",
  "linear-gradient(150deg,var(--dream-blue),var(--dream-mint) 60%,var(--dream-butter))",
  "linear-gradient(150deg,var(--dream-lilac),var(--dream-blue) 60%,var(--dream-mint))",
];

/** Poster image, or a soft gradient with the title when there's no poster yet. */
export function FilmPoster({
  film,
  sizes,
  className,
}: {
  film: FilmReview;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {film.posterUrl ? (
        <Image src={film.posterUrl} alt={`${film.title} poster`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          style={{ background: gradients[film.id % gradients.length] }}
        >
          <Film className="size-8 text-[var(--on-dream)] opacity-70" />
          <span className="font-display italic text-2xl leading-tight text-[var(--on-dream)]">
            {film.title}
          </span>
        </div>
      )}
    </div>
  );
}
