import { db, schema } from "@/db";
import { createBoardMessageSchema } from "@/utils/validation";
import { desc, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const board = new Hono();

const PAGE_SIZE = 30;

// GET /board?before=<id> - newest first, 30 at a time (cursor = last id seen)
board.get("/", async (c) => {
  const before = Number(c.req.query("before"));
  try {
    const rows = await db
      .select()
      .from(schema.boardMessages)
      .where(Number.isInteger(before) && before > 0 ? lt(schema.boardMessages.id, before) : undefined)
      .orderBy(desc(schema.boardMessages.id))
      .limit(PAGE_SIZE + 1);
    const hasMore = rows.length > PAGE_SIZE;
    const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    return c.json(
      {
        success: true,
        data: { items, nextCursor: hasMore ? items[items.length - 1].id : null },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching board messages:", error);
    return c.json({ success: false, error: "Error fetching messages" }, 500);
  }
});

// POST /board - admin only: add a message bubble
board.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const parsed = createBoardMessageSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid message" },
        400,
      );
    }
    const { content, imageUrl } = parsed.data;
    const [inserted] = await db
      .insert(schema.boardMessages)
      .values({ content, imageUrl: imageUrl ?? null })
      .$returningId();
    const [row] = await db
      .select()
      .from(schema.boardMessages)
      .where(eq(schema.boardMessages.id, inserted.id))
      .limit(1);
    return c.json({ success: true, data: row }, 201);
  } catch (error) {
    console.error("Error creating board message:", error);
    return c.json({ success: false, error: "Error posting message" }, 500);
  }
});

// DELETE /board/:id - admin only
board.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ success: false, error: "Invalid id" }, 400);
  }
  try {
    await db.delete(schema.boardMessages).where(eq(schema.boardMessages.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting board message:", error);
    return c.json({ success: false, error: "Error deleting message" }, 500);
  }
});

export default board;
