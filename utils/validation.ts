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

/** Optional publish time for posts and notes, set by hand in admin. */
export const createdAtSchema = z.object({
  createdAt: z.coerce.date({ error: "Invalid upload time" }).optional(),
});

export const createNoteSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string(),
  category: z.string().min(1, "Category is required").max(100),
  tags: z.array(z.string()).default([]),
  pdfUrl: z.string().url().max(500).nullable().optional(),
}).refine((d) => d.content.trim().length > 0 || !!d.pdfUrl, {
  message: "Write some content or attach a PDF",
  path: ["content"],
});

export const updateNoteSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  tags: z.array(z.string()).optional(),
  pdfUrl: z.string().url().max(500).nullable().optional(),
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

export const createInterestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const dailyImageSchema = z.object({
  url: z.string().url("Invalid image URL").max(500),
  caption: z.string().max(300, "Caption must be 300 characters or less"),
});

export const createDailyPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  content: z.string().max(100000),
  images: z.array(dailyImageSchema).min(1, "Add at least one photo").max(20),
});

export const updateDailyPostSchema = createDailyPostSchema.partial();

export type CreateDailyPostInput = z.infer<typeof createDailyPostSchema>;
export type UpdateDailyPostInput = z.infer<typeof updateDailyPostSchema>;

export const filmKinds = ["movie", "series", "anime", "documentary"] as const;

export const createFilmReviewSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  originalTitle: z.string().trim().max(255).optional().nullable(),
  year: z.number().int().min(1880, "Year looks too early").max(2100, "Year looks too late"),
  kind: z.enum(filmKinds),
  rating: z.number().min(0).max(5).multipleOf(0.5, "Rating must be in half-star steps"),
  genres: z.array(z.string().trim().min(1).max(50)).max(10),
  posterUrl: z.string().url("Invalid poster URL").max(500).optional().nullable(),
  verdict: z.string().trim().min(1, "Verdict is required").max(300),
  review: z.string().max(100000),
  watchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Watched date must be YYYY-MM-DD"),
  topRank: z.number().int().min(1).max(5).optional().nullable(),
});

export const updateFilmReviewSchema = createFilmReviewSchema.partial();

export type CreateFilmReviewInput = z.infer<typeof createFilmReviewSchema>;
export type UpdateFilmReviewInput = z.infer<typeof updateFilmReviewSchema>;

export const createBoardMessageSchema = z
  .object({
    content: z.string().trim().max(500, "Message must be 500 characters or less"),
    imageUrl: z.string().url("Invalid image URL").max(500).optional().nullable(),
  })
  .refine((m) => m.content.length > 0 || !!m.imageUrl, {
    message: "Write a message or add a photo",
  });

export type CreateBoardMessageInput = z.infer<typeof createBoardMessageSchema>;

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
