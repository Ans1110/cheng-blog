import type { IvePlatform, IveVideoMeta } from "@/types/ive";

/** Server-only: resolves a YouTube or Bilibili link to its title, cover and uploader. */

const TIMEOUT_MS = 8000;
// Bilibili's API rejects requests with no browser-like User-Agent (code -412).
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

export class VideoMetaError extends Error {}

type ParsedLink = { platform: IvePlatform; id: string };

const YT_ID = /^[\w-]{11}$/;
const BV_ID = /^BV[0-9A-Za-z]{10}$/;

export function parseVideoLink(raw: string): ParsedLink | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YT_ID.test(id) ? { platform: "youtube", id } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const fromQuery = url.searchParams.get("v");
    const [, kind, fromPath] = url.pathname.split("/");
    const id =
      fromQuery ?? (["shorts", "live", "embed", "v"].includes(kind) ? fromPath : undefined);
    return id && YT_ID.test(id) ? { platform: "youtube", id } : null;
  }
  if (host === "bilibili.com") {
    const match = url.pathname.match(/\/video\/(BV[0-9A-Za-z]{10}|av\d+)/i);
    if (!match) return null;
    const id = match[1].startsWith("BV") ? match[1] : match[1].toLowerCase();
    return { platform: "bilibili", id };
  }
  return null;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new VideoMetaError(refusedMessage(res.status));
  return res.json();
}

/** b23.tv short links redirect to the real bilibili.com/video/… page. */
async function expandShortLink(raw: string): Promise<string> {
  const host = new URL(raw).hostname;
  if (host !== "b23.tv") return raw;
  const res = await fetch(raw, {
    headers: HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return res.url;
}

async function youtubeMeta(id: string): Promise<IveVideoMeta> {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const data = (await fetchJson(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  )) as { title?: string; author_name?: string };
  if (!data.title) throw new VideoMetaError("YouTube returned no title for this video");

  // maxres is sharper but missing on some uploads; hqdefault always exists.
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const hasMaxres = await fetch(maxres, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS) })
    .then((r) => r.ok)
    .catch(() => false);

  return {
    platform: "youtube",
    videoId: id,
    url,
    title: data.title,
    thumbnailUrl: hasMaxres ? maxres : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    author: data.author_name ?? null,
    durationSec: null,
    publishedAt: null,
  };
}

async function bilibiliMeta(id: string): Promise<IveVideoMeta> {
  const query = id.startsWith("BV") ? `bvid=${id}` : `aid=${id.slice(2)}`;
  const body = (await fetchJson(`https://api.bilibili.com/x/web-interface/view?${query}`)) as {
    code: number;
    message?: string;
    data?: {
      bvid: string;
      title: string;
      pic: string;
      duration?: number;
      pubdate?: number;
      owner?: { name?: string };
    };
  };
  if (body.code !== 0 || !body.data) {
    throw new VideoMetaError(`Bilibili: ${body.message || `error ${body.code}`}`);
  }
  const d = body.data;
  if (!BV_ID.test(d.bvid)) throw new VideoMetaError("Bilibili returned an unexpected video id");
  return {
    platform: "bilibili",
    videoId: d.bvid,
    url: `https://www.bilibili.com/video/${d.bvid}`,
    title: d.title,
    thumbnailUrl: d.pic.replace(/^http:/, "https:"),
    author: d.owner?.name ?? null,
    durationSec: d.duration ?? null,
    publishedAt: d.pubdate ? new Date(d.pubdate * 1000).toISOString() : null,
  };
}

type ResolvedLink = Pick<IveVideoMeta, "platform" | "videoId" | "url">;

/** Expands short links and normalizes the URL, without asking the platform for details. */
export async function resolveVideoLink(raw: string): Promise<ResolvedLink> {
  let link: string;
  try {
    link = await expandShortLink(raw);
  } catch {
    throw new VideoMetaError("Couldn't open that short link");
  }
  const parsed = parseVideoLink(link);
  if (!parsed) throw new VideoMetaError("Only YouTube and Bilibili video links are supported");
  return {
    platform: parsed.platform,
    videoId: parsed.id,
    url:
      parsed.platform === "youtube"
        ? `https://www.youtube.com/watch?v=${parsed.id}`
        : `https://www.bilibili.com/video/${parsed.id}`,
  };
}

const refusedMessage = (status: number) =>
  status === 412 || status === 403
    ? "The site blocked the lookup — fill in the title and cover yourself"
    : `The platform answered ${status}`;

export async function fetchVideoMeta(raw: string): Promise<IveVideoMeta> {
  const { platform, videoId } = await resolveVideoLink(raw);
  try {
    return platform === "youtube" ? await youtubeMeta(videoId) : await bilibiliMeta(videoId);
  } catch (error) {
    if (error instanceof VideoMetaError) throw error;
    throw new VideoMetaError("Couldn't reach the video platform, try again");
  }
}
