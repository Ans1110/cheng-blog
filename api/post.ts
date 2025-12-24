import { db, schema } from "@/db";
import { createPostSchema, updatePostSchema } from "@/utils/validation";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { mutationRateLimiter } from "./middleware/rateLimiter";

const posts = new Hono();

// GET /posts - get all posts
posts.get("/", async (c) => {
  const { tag, published } = c.req.query();

  try {
    let result = await db
      .select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt));

    if (published !== undefined) {
      const isPublished = published === "true";
      result = result.filter((post) => post.published === isPublished);
    }

    if (tag) {
      result = result.filter((post) => post.tags?.includes(tag));
    }

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching posts",
      },
      500
    );
  }
});

// GET /posts/:slug - get post by slug
posts.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const result = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return c.json(
        {
          success: false,
          message: "Post not found",
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
    console.error("Error fetching post:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching post",
      },
      500
    );
  }
});

// POST /posts - create post
posts.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          message: firstIssue?.message || "Invalid post data",
        },
        400
      );
    }

    const { slug, title, content, excerpt, tags, published } = parsed.data;

    const existingPost = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return c.json(
        {
          success: false,
          message: "Post with this slug already exists",
        },
        400
      );
    }

    const result = await db.insert(schema.posts).values({
      slug,
      title,
      content,
      excerpt: excerpt || null,
      tags: tags || [],
      published: published || false,
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
    console.error("Error creating post:", error);
    return c.json(
      {
        success: false,
        message: "Error creating post",
      },
      500
    );
  }
});

// PUT /posts/:id - update post
posts.put("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      {
        success: false,
        message: "Invalid post ID",
      },
      400
    );

  try {
    const body = await c.req.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          message: firstIssue?.message || "Invalid post data",
        },
        400
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    if (updateData.slug) {
      const existingPost = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.slug, updateData.slug))
        .limit(1);

      if (existingPost.length > 0 && existingPost[0].id !== id) {
        return c.json(
          {
            success: false,
            message: "Post with this slug already exists",
          },
          400
        );
      }
    }

    await db
      .update(schema.posts)
      .set(updateData)
      .where(eq(schema.posts.id, id));

    return c.json(
      {
        success: true,
        message: "Post updated successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return c.json(
      {
        success: false,
        message: "Error updating post",
      },
      500
    );
  }
});

// DELETE /posts/:id - delete post
posts.delete("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      {
        success: false,
        message: "Invalid post ID",
      },
      400
    );

  try {
    await db.delete(schema.posts).where(eq(schema.posts.id, id));
    return c.json(
      {
        success: true,
        message: "Post deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return c.json(
      {
        success: false,
        message: "Error deleting post",
      },
      500
    );
  }
});

export default posts;
