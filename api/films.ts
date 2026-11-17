import { db, schema } from "@/db";
import { createFilmReviewSchema, updateFilmReviewSchema } from "@/utils/validation";
import { and, desc, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const films = new Hono();

/** Each Top 5 slot holds one film: taking a rank frees it from whoever had it. */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
const releaseRank = async (tx: Tx, rank: number | null | undefined, exceptId?: number) => {
  if (!rank) return;
  await tx
    .update(schema.filmReviews)
    .set({ topRank: null })
    .where(
      exceptId
        ? and(eq(schema.filmReviews.topRank, rank), ne(schema.filmReviews.id, exceptId))
        : eq(schema.filmReviews.topRank, rank),
    );
};

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// GET /films - list film reviews, most recently watched first
films.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.filmReviews)
      .orderBy(desc(schema.filmReviews.watchedAt), desc(schema.filmReviews.id));
    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error fetching film reviews:", error);
    return c.json({ success: false, error: "Error fetching film reviews" }, 500);
  }
});

// GET /films/:id - get one film review
films.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    const result = await db
      .select()
      .from(schema.filmReviews)
      .where(eq(schema.filmReviews.id, id))
      .limit(1);
    if (result.length === 0) {
      return c.json({ success: false, error: "Film review not found" }, 404);
    }
    return c.json({ success: true, data: result[0] }, 200);
  } catch (error) {
    console.error("Error fetching film review:", error);
    return c.json({ success: false, error: "Error fetching film review" }, 500);
  }
});

// POST /films - create a film review
films.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const parsed = createFilmReviewSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid film review" },
        400,
      );
    }
    const id = await db.transaction(async (tx) => {
      await releaseRank(tx, parsed.data.topRank);
      const [inserted] = await tx.insert(schema.filmReviews).values(parsed.data).$returningId();
      return inserted.id;
    });
    return c.json({ success: true, data: { id } }, 201);
  } catch (error) {
    console.error("Error creating film review:", error);
    return c.json({ success: false, error: "Error creating film review" }, 500);
  }
});

// PUT /films/:id - update a film review
films.put("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    const parsed = updateFilmReviewSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid film review" },
        400,
      );
    }
    await db.transaction(async (tx) => {
      await releaseRank(tx, parsed.data.topRank, id);
      await tx
        .update(schema.filmReviews)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(schema.filmReviews.id, id));
    });
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error updating film review:", error);
    return c.json({ success: false, error: "Error updating film review" }, 500);
  }
});

// DELETE /films/:id - delete a film review
films.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    await db.delete(schema.filmReviews).where(eq(schema.filmReviews.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting film review:", error);
    return c.json({ success: false, error: "Error deleting film review" }, 500);
  }
});

export default films;
