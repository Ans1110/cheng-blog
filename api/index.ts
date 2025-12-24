import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import auth from "./auth";
import posts from "./post";
import projects from "./project";
import upload from "./upload";
import notes from "./notes";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
  })
);

// Routes
app.route("/auth", auth);
app.route("/posts", posts);
app.route("/upload", upload);
app.route("/projects", projects);
app.route("/notes", notes);

app.get("/health", (c) =>
  c.json({ success: true, message: "API is running" }, 200)
);

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ success: false, message: "Internal server error" }, 500);
});

app.get("*", (c) => c.json({ success: false, message: "Not Found" }, 404));

export default app;
