"use client";

import { PageHeader } from "@/components/dream/PageParts";
import { collectionName } from "@/components/record/ive/ArchiveSection";
import { VideoCard } from "@/components/record/ive/VideoCard";
import { useIveVideos } from "@/hooks/useIve";
import { iveSectionLabel } from "@/types/ive";
import { iveCollectionSections, type IveSection } from "@/utils/validation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const safeDecode = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export default function IveCollectionPage() {
  const params = useParams<{ section: string; collection: string }>();
  const section = params.section as IveSection;
  const name = safeDecode(params.collection);
  const validSection = iveCollectionSections.includes(section);

  const { data, isLoading, error } = useIveVideos();
  const videos = useMemo(
    () =>
      validSection
        ? (data ?? []).filter((v) => v.section === section && collectionName(v) === name)
        : [],
    [data, section, name, validSection],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <Link
        href="/record/kpop/archive"
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        IVE Archive
      </Link>

      <PageHeader
        title={name}
        size="sm"
        meta={
          validSection
            ? `${iveSectionLabel[section]}${videos.length ? ` · ${videos.length} ${videos.length === 1 ? "video" : "videos"}` : ""}`
            : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-20 text-center text-muted-foreground">{error.message}</p>
      ) : videos.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          This collection doesn&apos;t exist or has no videos yet.
        </p>
      ) : (
        <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => (
            <motion.li
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoCard
                video={v}
                className="w-full sm:w-full"
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              />
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
