import {
  boolean,
  index,
  int,
  json,
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
  ]
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
    createdAt: timestamp("created_at").default(new Date()),
    updatedAt: timestamp("updated_at").default(new Date()),
  },
  (table) => [
    index("notes_created_at_idx").on(table.createdAt),
    index("notes_category_idx").on(table.category),
  ]
);

export const noteCategories = mysqlTable("note_categories", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  createdAt: timestamp("created_at").default(new Date()),
  updatedAt: timestamp("updated_at").default(new Date()),
});

export const admin = mysqlTable("admin", {
  id: int("id").primaryKey().autoincrement(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
});

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
    createdAt: timestamp("created_at").default(new Date()),
    updatedAt: timestamp("updated_at").default(new Date()),
  },
  (table) => [index("projects_created_at_idx").on(table.createdAt)]
);

export const learningExperiences = mysqlTable(
  "learning_experiences",
  {
    id: int("id").primaryKey().autoincrement(),
    year: int("year").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    skills: json("skills").$type<string[]>().default([]),
    createdAt: timestamp("created_at").default(new Date()),
    updatedAt: timestamp("updated_at").default(new Date()),
  },
  (table) => [index("learning_experiences_year_idx").on(table.year)]
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
