import { db, schema } from "@/db";
import { desc, eq, not } from "drizzle-orm";
import { Hono } from "hono";
import { success } from "zod";
import { mutationRateLimiter } from "./middleware/rateLimiter";
import { createNoteSchema, updateNoteSchema } from "@/utils/validation";

const notes = new Hono();

// GET /notes - get all notes
notes.get("/", async (c) => {
  const { category } = c.req.query();

  try {
    const query = db
      .select()
      .from(schema.notes)
      .orderBy(desc(schema.notes.createdAt));

    let result = await query;
    if (category) {
      result = result.filter((note) => note.category === category);
    }

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching notes:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching notes",
      },
      500
    );
  }
});

// GET /notes/categories - get all unique categories
notes.get("/categories", async (c) => {
  try {
    const result = await db.select().from(schema.notes);

    const categories = [...new Set(result.map((note) => note.category))];

    return c.json(
      {
        success: true,
        data: categories,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching categories",
      },
      500
    );
  }
});

// GET /notes/:slug - get note by slug
notes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  // skip if slug=categories
  if (slug === "categories") {
    return c.json(
      {
        success: false,
        error: "Invalid slug",
      },
      400
    );
  }

  try {
    const result = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return c.json(
        {
          success: false,
          error: "Note not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        data: result[0],
      },
      200
    );
  } catch (error) {
    console.error("Error fetching note:", error);
    return c.json(
      {
        success: false,
        error: "Error fetching note",
      },
      500
    );
  }
});

// POST /notes - create note
notes.post("/", mutationRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid note data",
        },
        400
      );
    }

    const { slug, title, content, category, tags } = parsed.data;

    const existingNote = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.slug, slug))
      .limit(1);

    if (existingNote.length > 0) {
      return c.json(
        {
          success: false,
          error: "Note with this slug already exists",
        },
        400
      );
    }

    const result = await db.insert(schema.notes).values({
      slug,
      title,
      content,
      category,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json(
      {
        success: true,
        data: result[0].insertId,
      },
      201
    );
  } catch (error) {
    console.error("Error creating note:", error);
    return c.json(
      {
        success: false,
        error: "Error creating note",
      },
      500
    );
  }
});

// PUT /notes/:id - update note
notes.put("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json(
      {
        success: false,
        error: "Invalid note ID",
      },
      400
    );
  }

  try {
    const body = await c.req.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid note data",
        },
        400
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    if (updateData.slug) {
      const existingNote = await db
        .select()
        .from(schema.notes)
        .where(eq(schema.notes.slug, updateData.slug))
        .limit(1);

      if (existingNote.length > 0 && existingNote[0].id !== id) {
        return c.json(
          {
            success: false,
            error: "Note with this slug already exists",
          },
          400
        );
      }
    }

    await db
      .update(schema.notes)
      .set(updateData)
      .where(eq(schema.notes.id, id));

    return c.json(
      {
        success: true,
        data: id,
      },
      200
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return c.json(
      {
        success: false,
        error: "Error updating note",
      },
      500
    );
  }
});

// DELETE /notes/:id - delete note
notes.delete("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json(
      {
        success: false,
        error: "Invalid note ID",
      },
      400
    );
  }

  try {
    await db.delete(schema.notes).where(eq(schema.notes.id, id));
    return c.json(
      {
        success: true,
        data: id,
      },
      200
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return c.json(
      {
        success: false,
        error: "Error deleting note",
      },
      500
    );
  }
});

export default notes;
