import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { mutationRateLimiter } from "./middleware/rateLimiter";
import { authMiddleware } from "./middleware/auth";

const learning = new Hono();

// GET /learning - get all learning experiences
learning.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.learningExperiences)
      .orderBy(desc(schema.learningExperiences.year));

    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error fetching learning experiences:", error);
    return c.json(
      { success: false, error: "Error fetching learning experiences" },
      500
    );
  }
});

// GET /learning/:id - get a learning experience by id
learning.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      { success: false, error: "Invalid learning experience ID" },
      400
    );

  try {
    const result = await db
      .select()
      .from(schema.learningExperiences)
      .where(eq(schema.learningExperiences.id, id))
      .limit(1);

    if (result.length === 0)
      return c.json(
        { success: false, error: "Learning experience not found" },
        404
      );

    return c.json({ success: true, data: result[0] }, 200);
  } catch (error) {
    console.error("Error fetching learning experience:", error);
    return c.json(
      { success: false, error: "Error fetching learning experience" },
      500
    );
  }
});

// POST /learning - create a new learning experience
learning.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const { year, title, skills } = body;

    if (!year || !title) {
      return c.json(
        { success: false, error: "Year and title are required" },
        400
      );
    }

    const result = await db.insert(schema.learningExperiences).values({
      year,
      title,
      skills: skills || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json({ success: true, data: { id: result[0].insertId } }, 201);
  } catch (error) {
    console.error("Error creating learning experience:", error);
    return c.json(
      { success: false, error: "Error creating learning experience" },
      500
    );
  }
});

// PUT /learning/:id - update a learning experience
learning.put("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      { success: false, error: "Invalid learning experience ID" },
      400
    );

  try {
    const body = await c.req.json();
    const { year, title, skills } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (year !== undefined) updateData.year = year;
    if (title !== undefined) updateData.title = title;
    if (skills !== undefined) updateData.skills = skills;

    await db
      .update(schema.learningExperiences)
      .set(updateData)
      .where(eq(schema.learningExperiences.id, id));

    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error updating learning experience:", error);
    return c.json(
      { success: false, error: "Error updating learning experience" },
      500
    );
  }
});

// DELETE /learning/:id - delete a learning experience
learning.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      { success: false, error: "Invalid learning experience ID" },
      400
    );

  try {
    await db
      .delete(schema.learningExperiences)
      .where(eq(schema.learningExperiences.id, id));
    return c.json({ success: true, data: id }, 200);
  } catch (error) {
    console.error("Error deleting learning experience:", error);
    return c.json(
      { success: false, error: "Error deleting learning experience" },
      500
    );
  }
});

export default learning;
