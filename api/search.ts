import { db, schema } from "@/db";
import { desc, like, or } from "drizzle-orm";
import { Hono } from "hono";

interface Result {
  posts: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    tags: string[] | null;
    published: boolean | null;
  }>;
  notes: Array<{
    id: number;
    slug: string;
    title: string;
    category: string;
  }>;
}

const search = new Hono();

// GET /search - search for posts and notes
search.get("/", async (c) => {
  const { q, type = "all" } = c.req.query();

  if (!q || q.trim().length === 0)
    return c.json({ success: false, error: "Query is required" }, 400);

  const query = `%${q.trim()}%`;

  try {
    const result: Result = {
      posts: [],
      notes: [],
    };

    if (type === "all" || type === "posts") {
      const posts = await db
        .select({
          id: schema.posts.id,
          slug: schema.posts.slug,
          title: schema.posts.title,
          excerpt: schema.posts.excerpt,
          tags: schema.posts.tags,
          published: schema.posts.published,
        })
        .from(schema.posts)
        .where(
          or(
            like(schema.posts.title, query),
            like(schema.posts.content, query),
            like(schema.posts.excerpt, query),
            like(schema.posts.tags, query)
          )
        )
        .orderBy(desc(schema.posts.createdAt));

      // published posts only
      result.posts = posts.filter((post) => post.published === true);
    }

    if (type === "all" || type === "notes") {
      const notes = await db
        .select({
          id: schema.notes.id,
          slug: schema.notes.slug,
          title: schema.notes.title,
          category: schema.notes.category,
        })
        .from(schema.notes)
        .where(
          or(like(schema.notes.title, query), like(schema.notes.content, query))
        )
        .orderBy(desc(schema.notes.createdAt));

      result.notes = notes;
    }

    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    console.error("Error searching:", error);
    return c.json({ success: false, error: "Error searching" }, 500);
  }
});

// GET /search/posts - get all unique tags from posts
search.get("/tags", async (c) => {
  try {
    const posts = await db
      .select({
        tags: schema.posts.tags,
      })
      .from(schema.posts);

    const allTags = posts
      .flatMap((post) => post.tags || [])
      .filter((tag): tag is string => typeof tag === "string");

    const uniqueTags = [...new Set(allTags)].sort();

    return c.json({ success: true, data: uniqueTags }, 200);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return c.json({ success: false, error: "Error fetching tags" }, 500);
  }
});

export default search;
