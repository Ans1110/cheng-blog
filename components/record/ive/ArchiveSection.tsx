"use client";

import type { IveVideo } from "@/types/ive";
import type { IveSection } from "@/utils/validation";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VideoCard } from "./VideoCard";

export type IveCollection = { name: string; videos: IveVideo[] };

/** A video's collection, with ungrouped videos gathered under "Unsorted". */
export const collectionName = (v: IveVideo) => v.collection?.trim() || "Unsorted";

export const collectionHref = (section: IveSection, name: string) =>
  `/record/kpop/archive/${section}/${encodeURIComponent(name)}`;

/** Groups videos by collection name, keeping the order they arrive in (newest first). */
export function groupCollections(videos: IveVideo[]): IveCollection[] {
  const map = new Map<string, IveVideo[]>();
  for (const v of videos) {
    const name = collectionName(v);
    map.set(name, [...(map.get(name) ?? []), v]);
  }
  return [...map].map(([name, list]) => ({ name, videos: list }));
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-3 pb-3 [scrollbar-width:thin] md:gap-5">
      {children}
    </div>
  );
}

export function ArchiveSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <h2 className="flex items-baseline gap-3">
        <span className="relative font-display text-3xl italic leading-none md:text-4xl">
          {title}
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-[linear-gradient(90deg,var(--dream-pink),var(--dream-lilac),transparent)]"
          />
        </span>
        <span className="eyebrow">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--glass-border)] py-10 text-center text-sm text-muted-foreground">
          Nothing here yet
        </p>
      ) : (
        children
      )}
    </motion.section>
  );
}

export function VideoRow({ videos }: { videos: IveVideo[] }) {
  return (
    <Row>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </Row>
  );
}

/** Collection covers; each opens its collection page. */
export function CollectionRow({
  section,
  collections,
}: {
  section: IveSection;
  collections: IveCollection[];
}) {
  return (
    <Row>
      {collections.map((c) => (
        <Link
          key={c.name}
          href={collectionHref(section, c.name)}
          className="group w-44 shrink-0 snap-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--dream-lilac)] sm:w-52"
        >
          <div className="relative aspect-square transition-transform duration-300 group-hover:-translate-y-1">
            {/* Stacked-card edges hint that this holds several videos */}
            <span
              aria-hidden
              className="absolute inset-x-3 -top-2 bottom-2 rounded-2xl bg-[color-mix(in_oklch,var(--dream-lilac)_35%,transparent)]"
            />
            <div className="absolute inset-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-[var(--glass-border)]">
              <Image
                src={c.videos[0].thumbnailUrl}
                alt=""
                fill
                sizes="208px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="line-clamp-2 font-display text-lg italic leading-tight">{c.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/75">
                  <Layers className="size-3" />
                  {c.videos.length} {c.videos.length === 1 ? "video" : "videos"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </Row>
  );
}
