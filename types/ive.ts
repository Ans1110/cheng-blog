import type { IveSection } from "@/utils/validation";

export type IvePlatform = "youtube" | "bilibili";

export interface IveVideo {
  id: number;
  platform: IvePlatform;
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  author?: string | null;
  durationSec?: number | null;
  publishedAt?: string | null;
  section: IveSection;
  collection?: string | null;
  recommended: boolean;
  createdAt: string;
}

/** What the platform tells us about a link, before it is saved. */
export interface IveVideoMeta {
  platform: IvePlatform;
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  author: string | null;
  durationSec: number | null;
  publishedAt: string | null;
}

export const iveSectionLabel: Record<IveSection, string> = {
  mv: "MVs",
  stage: "Stage",
  live: "Live",
  behind: "Behind",
  "123ive": "123 IVE",
  personal: "Personal",
  variety: "Variety",
  cheering: "Cheering Guide",
};
