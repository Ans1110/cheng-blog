import { db, schema } from "@/db";
import {
  createNoteCategorySchema,
  updateNoteCategorySchema,
} from "@/utils/validation";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { mutationRateLimiter } from "./middleware/rateLimiter";
import { authMiddleware } from "./middleware/auth";

const categories = new Hono();

// GET /categories - get all categories
categories.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.noteCategories)
      .orderBy(desc(schema.noteCategories.createdAt));

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json(
      {
        success: false,
        error: "Error fetching categories",
      },
      500
    );
  }
});

// GET /categories/:id - get category by id
categories.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db
      .select()
      .from(schema.noteCategories)
      .where(eq(schema.noteCategories.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json(
        {
          success: false,
          error: "Category not found",
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
    console.error("Error fetching category:", error);
    return c.json(
      {
        success: false,
        error: "Error fetching category",
      },
      500
    );
  }
});

// POST /categories - create category
categories.post("/", authMiddleware, mutationRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createNoteCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid category data",
        },
        400
      );
    }

    const { id, name, description, icon } = parsed.data;

    const existingCategory = await db
      .select()
      .from(schema.noteCategories)
      .where(eq(schema.noteCategories.id, id))
      .limit(1);

    if (existingCategory.length > 0) {
      return c.json(
        {
          success: false,
          error: "Category with this ID already exists",
        },
        400
      );
    }

    await db.insert(schema.noteCategories).values({
      id,
      name,
      description,
      icon,
    });

    return c.json(
      {
        success: true,
        data: { id },
      },
      201
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json(
      {
        success: false,
        error: "Error creating category",
      },
      500
    );
  }
});

// PUT /categories/:id - update category
categories.put("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = c.req.param("id");

  try {
    const body = await c.req.json();
    const parsed = updateNoteCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid category data",
        },
        400
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    await db
      .update(schema.noteCategories)
      .set(updateData)
      .where(eq(schema.noteCategories.id, id));

    return c.json(
      {
        success: true,
        data: id,
      },
      200
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json(
      {
        success: false,
        error: "Error updating category",
      },
      500
    );
  }
});

// DELETE /categories/:id - delete category
categories.delete("/:id", authMiddleware, mutationRateLimiter, async (c) => {
  const id = c.req.param("id");
  try {
    // check if any notes are using this category
    const notesWithCategory = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.category, id))
      .limit(1);

    if (notesWithCategory.length > 0) {
      return c.json(
        {
          success: false,
          error: "Category is still in use by notes",
        },
        400
      );
    }

    await db
      .delete(schema.noteCategories)
      .where(eq(schema.noteCategories.id, id));
    return c.json(
      {
        success: true,
        data: id,
      },
      200
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json(
      {
        success: false,
        error: "Error deleting category",
      },
      500
    );
  }
});

export default categories;
