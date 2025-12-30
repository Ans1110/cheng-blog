import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { db, schema } from "@/db";
import { eq, lt } from "drizzle-orm";

const COOKIE_NAME = "admin_session";

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, COOKIE_NAME);

  if (!token) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  // Validate session against database
  const session = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .limit(1);

  if (session.length === 0) {
    return c.json({ success: false, message: "Invalid session" }, 401);
  }

  // Check if session has expired
  if (new Date(session[0].expiresAt) < new Date()) {
    // Clean up expired session
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
    return c.json({ success: false, message: "Session expired" }, 401);
  }

  await next();
};

// Helper to clean up expired sessions (can be called periodically)
export const cleanupExpiredSessions = async () => {
  await db
    .delete(schema.sessions)
    .where(lt(schema.sessions.expiresAt, new Date()));
};
