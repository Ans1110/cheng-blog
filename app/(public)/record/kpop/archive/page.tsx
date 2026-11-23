"use client";

import { ArchiveHero } from "@/components/record/ive/ArchiveHero";
import {
  ArchiveSection,
  CollectionRow,
  groupCollections,
  VideoRow,
} from "@/components/record/ive/ArchiveSection";
import { useIveCover, useIveVideos } from "@/hooks/useIve";
import { iveSectionLabel } from "@/types/ive";
import { iveCollectionSections, iveSections } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function IveArchivePage() {
  const { data, isLoading, error } = useIveVideos();
  const { data: cover } = useIveCover();

  const { recommended, bySection } = useMemo(() => {
    const videos = data ?? [];
    return {
      recommended: videos.filter((v) => v.recommended),
      bySection: Object.fromEntries(
        iveSections.map((s) => [s, videos.filter((v) => v.section === s)]),
      ),
    };
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <ArchiveHero coverUrl={cover?.coverUrl} position={cover?.position} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-20 text-center text-muted-foreground">{error.message}</p>
      ) : (
        <div className="space-y-14">
          <ArchiveSection title="Recommend" count={recommended.length}>
            <VideoRow videos={recommended} />
          </ArchiveSection>

          {iveSections.map((section) => {
            const videos = bySection[section];
            const isCollection = iveCollectionSections.includes(section);
            const collections = isCollection ? groupCollections(videos) : [];
            return (
              <ArchiveSection
                key={section}
                title={iveSectionLabel[section]}
                count={isCollection ? collections.length : videos.length}
              >
                {isCollection ? (
                  <CollectionRow section={section} collections={collections} />
                ) : (
                  <VideoRow videos={videos} />
                )}
              </ArchiveSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
