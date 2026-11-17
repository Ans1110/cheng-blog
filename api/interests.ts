import { db, schema } from "@/db";
import { createInterestSchema } from "@/utils/validation";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const interests = new Hono();

// GET /interests - list all interests (oldest first, so new ones append)
interests.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.interests)
      .orderBy(asc(schema.interests.createdAt), asc(schema.interests.id));
    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error fetching interests:", error);
    return c.json({ success: false, error: "Error fetching interests" }, 500);
  }
});

// POST /interests - add an interest
interests.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const parsed = createInterestSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid interest" },
        400,
      );
    }

    const { name } = parsed.data;
    const existing = await db
      .select()
      .from(schema.interests)
      .where(eq(schema.interests.name, name))
      .limit(1);
    if (existing.length > 0) {
      return c.json({ success: false, error: "Interest already exists" }, 400);
    }

    const [inserted] = await db.insert(schema.interests).values({ name }).$returningId();
    return c.json({ success: true, data: { id: inserted.id } }, 201);
  } catch (error) {
    console.error("Error creating interest:", error);
    return c.json({ success: false, error: "Error creating interest" }, 500);
  }
});

// DELETE /interests/:id - remove an interest
interests.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ success: false, error: "Invalid id" }, 400);
  }
  try {
    await db.delete(schema.interests).where(eq(schema.interests.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting interest:", error);
    return c.json({ success: false, error: "Error deleting interest" }, 500);
  }
});

export default interests;
