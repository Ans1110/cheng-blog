import { db, schema } from "@/db";
import { createDailyPostSchema, updateDailyPostSchema } from "@/utils/validation";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const daily = new Hono();

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// GET /daily - list daily posts, newest first
daily.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.dailyPosts)
      .orderBy(desc(schema.dailyPosts.createdAt), desc(schema.dailyPosts.id));
    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error fetching daily posts:", error);
    return c.json({ success: false, error: "Error fetching daily posts" }, 500);
  }
});

// GET /daily/:id - get one daily post
daily.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    const result = await db
      .select()
      .from(schema.dailyPosts)
      .where(eq(schema.dailyPosts.id, id))
      .limit(1);
    if (result.length === 0) {
      return c.json({ success: false, error: "Daily post not found" }, 404);
    }
    return c.json({ success: true, data: result[0] }, 200);
  } catch (error) {
    console.error("Error fetching daily post:", error);
    return c.json({ success: false, error: "Error fetching daily post" }, 500);
  }
});

// POST /daily - create a daily post
daily.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const parsed = createDailyPostSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid daily post" },
        400,
      );
    }
    const [inserted] = await db.insert(schema.dailyPosts).values(parsed.data).$returningId();
    return c.json({ success: true, data: { id: inserted.id } }, 201);
  } catch (error) {
    console.error("Error creating daily post:", error);
    return c.json({ success: false, error: "Error creating daily post" }, 500);
  }
});

// PUT /daily/:id - update a daily post
daily.put("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    const parsed = updateDailyPostSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid daily post" },
        400,
      );
    }
    await db
      .update(schema.dailyPosts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.dailyPosts.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error updating daily post:", error);
    return c.json({ success: false, error: "Error updating daily post" }, 500);
  }
});

// DELETE /daily/:id - delete a daily post
daily.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ success: false, error: "Invalid id" }, 400);
  try {
    await db.delete(schema.dailyPosts).where(eq(schema.dailyPosts.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting daily post:", error);
    return c.json({ success: false, error: "Error deleting daily post" }, 500);
  }
});

export default daily;
