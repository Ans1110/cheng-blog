import { cn } from "@/lib/utils";
import type { IveVideo } from "@/types/ive";
import Image from "next/image";

export function formatDuration(sec?: number | null) {
  if (!sec) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export const platformLabel = { youtube: "YouTube", bilibili: "Bilibili" } as const;

/** 16:9 cover, title and uploader; opens the video on its platform. */
export function VideoCard({
  video,
  className,
  sizes = "(min-width: 640px) 288px, 256px",
}: {
  video: IveVideo;
  className?: string;
  /** Override when the card is wider than the default row card. */
  sizes?: string;
}) {
  const duration = formatDuration(video.durationSec);
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group block w-64 shrink-0 snap-start outline-none sm:w-72", className)}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-[var(--glass-border)] transition-shadow duration-300 group-hover:shadow-[0_10px_30px_-10px_var(--dream-lilac)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--dream-lilac)]">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {platformLabel[video.platform]}
        </span>
        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {duration}
          </span>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug group-hover:text-[var(--glow)]">
        {video.title}
      </p>
      {video.author && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{video.author}</p>
      )}
    </a>
  );
}
