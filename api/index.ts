import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import auth from "./auth";
import posts from "./post";
import projects from "./project";
import upload from "./upload";
import notes from "./notes";
import search from "./search";
import learning from "./learning";
import categories from "./categories";

const app = new Hono().basePath("/api");

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    // Default to same-origin only in production
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    // Allow localhost in development
    return ["http://localhost:3000"];
  }
  return origins.split(",").map((o) => o.trim());
};

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = getAllowedOrigins();
      // If no origin (same-origin request), allow
      if (!origin) return origin;
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) return origin;
      // In development, also allow localhost with any port
      if (
        process.env.NODE_ENV !== "production" &&
        origin.startsWith("http://localhost:")
      ) {
        return origin;
      }
      return null;
    },
    credentials: true,
  })
);

// Routes
app.route("/auth", auth);
app.route("/posts", posts);
app.route("/upload", upload);
app.route("/projects", projects);
app.route("/notes", notes);
app.route("/search", search);
app.route("/learning", learning);
app.route("/categories", categories);

app.get("/health", (c) =>
  c.json({ success: true, message: "API is running" }, 200)
);

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ success: false, message: "Internal server error" }, 500);
});

app.get("*", (c) => c.json({ success: false, message: "Not Found" }, 404));

export default app;
