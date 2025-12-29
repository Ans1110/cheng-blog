import { z } from "zod";

export const loginSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be less than 255 characters"),
});

export const createPostSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const createNoteSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required").max(100),
  tags: z.array(z.string()).default([]),
});

export const updateNoteSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const createNoteCategorySchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
});

export const updateNoteCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Query is required"),
  type: z.enum(["posts", "notes", "all"]).default("all"),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  imageUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid image URL",
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  projectUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid project URL",
    })
    .optional(),
  githubUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid GitHub URL",
    })
    .optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid image URL",
    })
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional(),
  projectUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid project URL",
    })
    .optional()
    .nullable(),
  githubUrl: z
    .string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid GitHub URL",
    })
    .optional()
    .nullable(),
});

export const createLearningSchema = z.object({
  year: z.number().min(1900, "Year must be greater than 1900"),
  title: z.string().min(1, "Title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export const updateLearningSchema = z.object({
  year: z.number().min(1900, "Year must be greater than 1900").optional(),
  title: z.string().min(1, "Title is required").optional(),
  skills: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateNoteCategoryInput = z.infer<typeof createNoteCategorySchema>;
export type UpdateNoteCategoryInput = z.infer<typeof updateNoteCategorySchema>;
export type CreateLearningInput = z.infer<typeof createLearningSchema>;
export type UpdateLearningInput = z.infer<typeof updateLearningSchema>;
