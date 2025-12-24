import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { mutationRateLimiter } from "./middleware/rateLimiter";
import { createProjectSchema, updateProjectSchema } from "@/utils/validation";

const projects = new Hono();

// GET /projects - get all projects
projects.get("/", async (c) => {
  try {
    const result = await db
      .select()
      .from(schema.projects)
      .orderBy(desc(schema.projects.createdAt));

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching projects",
      },
      500
    );
  }
});

// GET /projects/:id - get project by id
projects.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      {
        success: false,
        message: "Invalid project ID",
      },
      400
    );

  try {
    const result = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id))
      .limit(1);

    if (result.length === 0)
      return c.json(
        {
          success: false,
          message: "Project not found",
        },
        404
      );

    return c.json(
      {
        success: true,
        data: result[0],
      },
      200
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching project",
      },
      500
    );
  }
});

// POST /projects - create project
projects.post("/", mutationRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          message: firstIssue?.message || "Invalid project data",
        },
        400
      );
    }

    const { title, description, imageUrl, tags, projectUrl, githubUrl } =
      parsed.data;

    const existingProject = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.title, title))
      .limit(1);

    if (existingProject.length > 0) {
      return c.json(
        {
          success: false,
          message: "Project with this title already exists",
        },
        400
      );
    }

    const result = await db.insert(schema.projects).values({
      title,
      description,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      tags: tags || [],
      projectUrl: projectUrl && projectUrl.trim() ? projectUrl.trim() : null,
      githubUrl: githubUrl && githubUrl.trim() ? githubUrl.trim() : null,
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
    console.error("Error creating project:", error);
    return c.json(
      {
        success: false,
        message: "Error creating project",
      },
      500
    );
  }
});

// PUT /projects/:id - update project
projects.put("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      {
        success: false,
        message: "Invalid project ID",
      },
      400
    );

  try {
    const body = await c.req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json(
        {
          success: false,
          message: firstIssue?.message || "Invalid project data",
        },
        400
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    // convert empty strings to null for optional URL fields
    if (updateData.imageUrl !== undefined) {
      updateData.imageUrl =
        updateData.imageUrl && updateData.imageUrl.trim()
          ? updateData.imageUrl.trim()
          : null;
    }

    if (updateData.projectUrl !== undefined) {
      updateData.projectUrl =
        updateData.projectUrl && updateData.projectUrl.trim()
          ? updateData.projectUrl.trim()
          : null;
    }

    if (updateData.githubUrl !== undefined) {
      updateData.githubUrl =
        updateData.githubUrl && updateData.githubUrl.trim()
          ? updateData.githubUrl.trim()
          : null;
    }

    await db
      .update(schema.projects)
      .set(updateData)
      .where(eq(schema.projects.id, id));

    return c.json(
      {
        success: true,
        message: "Project updated successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json(
      {
        success: false,
        message: "Error updating project",
      },
      500
    );
  }
});

// DELETE /projects/:id - delete project
projects.delete("/:id", mutationRateLimiter, async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id))
    return c.json(
      {
        success: false,
        message: "Invalid project ID",
      },
      400
    );

  try {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));

    return c.json(
      {
        success: true,
        message: "Project deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json(
      {
        success: false,
        message: "Error deleting project",
      },
      500
    );
  }
});

export default projects;
