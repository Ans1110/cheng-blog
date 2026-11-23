import { db, schema } from "@/db";
import {
  createIveVideoSchema,
  iveCoverSchema,
  iveHasRequiredCollection,
  iveVideoUrlSchema,
  updateIveVideoSchema,
} from "@/utils/validation";
import { fetchVideoMeta, resolveVideoLink, VideoMetaError } from "@/utils/videoMeta";
import { desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const ive = new Hono();

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const metaErrorResponse = (error: unknown) =>
  error instanceof VideoMetaError ? error.message : "Couldn't read that video";

// GET /ive - every archived video, newest first
ive.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.iveVideos)
      .orderBy(desc(schema.iveVideos.createdAt), desc(schema.iveVideos.id));
    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error fetching IVE videos:", error);
    return c.json({ success: false, error: "Error fetching videos" }, 500);
  }
});

const COVER_KEY = "ive_cover";
/** Focal point of the cover as "x,y" percentages (CSS object-position). */
const COVER_POSITION_KEY = "ive_cover_position";
const CENTER = { x: 50, y: 50 };

const parsePosition = (raw?: string | null) => {
  const [x, y] = (raw ?? "").split(",").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : CENTER;
};

const readCover = async () => {
  const rows = await db
    .select()
    .from(schema.siteSettings)
    .where(inArray(schema.siteSettings.key, [COVER_KEY, COVER_POSITION_KEY]));
  const get = (key: string) => rows.find((r) => r.key === key)?.value ?? null;
  return { coverUrl: get(COVER_KEY), position: parsePosition(get(COVER_POSITION_KEY)) };
};

const writeSetting = (key: string, value: string | null) =>
  db
    .insert(schema.siteSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });

// GET /ive/cover - the archive's banner image (or null) and its focal point
ive.get("/cover", async (c) => {
  try {
    return c.json({ success: true, data: await readCover() }, 200);
  } catch (error) {
    console.error("Error fetching IVE cover:", error);
    return c.json({ success: false, error: "Error fetching cover" }, 500);
  }
});

// PUT /ive/cover - set or clear the banner image, and/or move its focal point.
// A new image without a position starts centered.
ive.put("/cover", authMiddleware, mutationRateLimiter, async (c) => {
  const parsed = iveCoverSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid cover" }, 400);
  }
  const { coverUrl, position } = parsed.data;
  try {
    if (coverUrl !== undefined) await writeSetting(COVER_KEY, coverUrl);
    const nextPosition = position ?? (coverUrl !== undefined ? CENTER : undefined);
    if (nextPosition) {
      const round = (n: number) => Math.round(n * 10) / 10;
      await writeSetting(COVER_POSITION_KEY, `${round(nextPosition.x)},${round(nextPosition.y)}`);
    }
    return c.json({ success: true, data: await readCover() }, 200);
  } catch (error) {
    console.error("Error saving IVE cover:", error);
    return c.json({ success: false, error: "Error saving cover" }, 500);
  }
});

// POST /ive/preview - look up a link's metadata without saving it
ive.post("/preview", authMiddleware, mutationRateLimiter, async (c) => {
  const parsed = iveVideoUrlSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid link" }, 400);
  }
  try {
    return c.json({ success: true, data: await fetchVideoMeta(parsed.data.url) }, 200);
  } catch (error) {
    console.error("Error previewing video:", error);
    return c.json({ success: false, error: metaErrorResponse(error) }, 422);
  }
});

// POST /ive - fetch the link's metadata and archive it
ive.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  const parsed = createIveVideoSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid video" }, 400);
  }
  const { url, section, collection, recommended, title, thumbnailUrl } = parsed.data;

  let meta;
  try {
    // Hand-entered details skip the lookup (e.g. when Bilibili blocks it).
    meta =
      title && thumbnailUrl
        ? {
            ...(await resolveVideoLink(url)),
            title,
            thumbnailUrl,
            author: null,
            durationSec: null,
            publishedAt: null,
          }
        : await fetchVideoMeta(url);
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    return c.json({ success: false, error: metaErrorResponse(error) }, 422);
  }

  try {
    const [inserted] = await db
      .insert(schema.iveVideos)
      .values({
        ...meta,
        publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : null,
        section,
        collection: collection?.trim() || null,
        recommended,
      })
      .$returningId();
    return c.json({ success: true, data: { id: inserted.id } }, 201);
  } catch (error) {
    console.error("Error saving IVE video:", error);
    return c.json({ success: false, error: "Error saving video" }, 500);
  }
});

// PUT /ive/:id - move a video to another section / collection, or (un)recommend it
ive.put("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  const parsed = updateIveVideoSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid video" }, 400);
  }
  try {
    const [current] = await db
      .select()
      .from(schema.iveVideos)
      .where(eq(schema.iveVideos.id, id))
      .limit(1);
    if (!current) return c.json({ success: false, error: "Video not found" }, 404);

    const next = { ...parsed.data };
    if (next.collection !== undefined) next.collection = next.collection?.trim() || null;
    const merged = { ...current, ...next };
    if (!iveHasRequiredCollection(merged)) {
      return c.json({ success: false, error: "This section needs a collection name" }, 400);
    }

    await db.update(schema.iveVideos).set(next).where(eq(schema.iveVideos.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error updating IVE video:", error);
    return c.json({ success: false, error: "Error updating video" }, 500);
  }
});

// DELETE /ive/:id
ive.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    await db.delete(schema.iveVideos).where(eq(schema.iveVideos.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting IVE video:", error);
    return c.json({ success: false, error: "Error deleting video" }, 500);
  }
});

export default ive;
