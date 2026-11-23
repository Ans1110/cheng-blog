import {
  boolean,
  date,
  double,
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const posts = mysqlTable(
  "posts",
  {
    id: int("id").primaryKey().autoincrement(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    tags: json("tags").$type<string[]>().default([]),
    published: boolean("published").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("posts_published_idx").on(table.published),
    index("posts_created_at_idx").on(table.createdAt),
  ],
);

export const notes = mysqlTable(
  "notes",
  {
    id: int("id").primaryKey().autoincrement(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    tags: json("tags").$type<string[]>().default([]),
    pdfUrl: varchar("pdf_url", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("notes_created_at_idx").on(table.createdAt),
    index("notes_category_idx").on(table.category),
  ],
);

export const noteCategories = mysqlTable("note_categories", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const interests = mysqlTable("interests", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DailyImage = { url: string; caption: string };

export const dailyPosts = mysqlTable(
  "daily_posts",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    content: longtext("content").notNull(),
    images: json("images").$type<DailyImage[]>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("daily_posts_created_at_idx").on(table.createdAt)],
);

export const filmReviews = mysqlTable(
  "film_reviews",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    originalTitle: varchar("original_title", { length: 255 }),
    year: int("year").notNull(),
    kind: mysqlEnum("kind", ["movie", "series", "anime", "documentary"]).notNull(),
    rating: double("rating").notNull(),
    genres: json("genres").$type<string[]>().notNull(),
    posterUrl: varchar("poster_url", { length: 500 }),
    verdict: varchar("verdict", { length: 300 }).notNull(),
    review: longtext("review").notNull(),
    watchedAt: date("watched_at", { mode: "string" }).notNull(),
    /** 1–5 when hand-picked for the Top 5 section, otherwise null. Unique among ranked films. */
    topRank: int("top_rank"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("film_reviews_watched_at_idx").on(table.watchedAt)],
);

export const boardMessages = mysqlTable(
  "board_messages",
  {
    id: int("id").primaryKey().autoincrement(),
    content: varchar("content", { length: 500 }).notNull(),
    /** Optional photo, only shown when the bubble is opened. */
    imageUrl: varchar("image_url", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("board_messages_created_at_idx").on(table.createdAt)],
);

export const iveVideos = mysqlTable(
  "ive_videos",
  {
    id: int("id").primaryKey().autoincrement(),
    platform: mysqlEnum("platform", ["youtube", "bilibili"]).notNull(),
    /** YouTube video id or Bilibili BV id. */
    videoId: varchar("video_id", { length: 32 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    /** Metadata is fetched from the platform once, when the link is added. */
    title: varchar("title", { length: 255 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }).notNull(),
    author: varchar("author", { length: 255 }),
    durationSec: int("duration_sec"),
    publishedAt: timestamp("published_at"),
    section: mysqlEnum("section", [
      "mv",
      "stage",
      "behind",
      "123ive",
      "personal",
      "variety",
      "cheering",
      "live",
    ]).notNull(),
    /** Group name inside the stage / 123 IVE / personal sections. */
    collection: varchar("collection", { length: 100 }),
    recommended: boolean("recommended").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("ive_videos_section_idx").on(table.section)],
);

/** Small key-value store for one-off site settings (e.g. the IVE Archive cover). */
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const admin = mysqlTable("admin", {
  id: int("id").primaryKey().autoincrement(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
});

export const sessions = mysqlTable(
  "sessions",
  {
    id: int("id").primaryKey().autoincrement(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("sessions_token_idx").on(table.token)],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const projects = mysqlTable(
  "projects",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    tags: json("tags").$type<string[]>().default([]),
    imageUrl: varchar("image_url", { length: 255 }),
    projectUrl: varchar("project_url", { length: 255 }),
    githubUrl: varchar("github_url", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("projects_created_at_idx").on(table.createdAt)],
);

export const learningExperiences = mysqlTable(
  "learning_experiences",
  {
    id: int("id").primaryKey().autoincrement(),
    year: int("year").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    skills: json("skills").$type<string[]>().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("learning_experiences_year_idx").on(table.year)],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type NoteCategory = typeof noteCategories.$inferSelect;
export type NewNoteCategory = typeof noteCategories.$inferInsert;

export type Admin = typeof admin.$inferSelect;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type LearningExperience = typeof learningExperiences.$inferSelect;
export type NewLearningExperience = typeof learningExperiences.$inferInsert;

export type Interest = typeof interests.$inferSelect;
export type DailyPost = typeof dailyPosts.$inferSelect;
export type FilmReview = typeof filmReviews.$inferSelect;
export type BoardMessage = typeof boardMessages.$inferSelect;
export type IveVideo = typeof iveVideos.$inferSelect;
