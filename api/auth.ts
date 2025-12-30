import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { loginRateLimiter } from "./middleware/rateLimiter";
import { loginSchema } from "@/utils/validation";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const auth = new Hono();

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Validate COOKIE_SECRET is set
const getCookieSecret = () => {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SECRET environment variable is required");
  }
  return secret;
};

// POST /auth/login
auth.post("/login", loginRateLimiter, async (c) => {
  try {
    // Validate secret is configured
    getCookieSecret();

    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json({ success: false, message: firstIssue.message }, 400);
    }

    const { password } = parsed.data;

    const adminRecord = await db.select().from(schema.admin).limit(1);

    if (adminRecord.length === 0) {
      // No admin record, check env
      const envPassword = process.env.ADMIN_PASSWORD;
      if (!envPassword) {
        return c.json(
          {
            success: false,
            message: "Server configuration error",
          },
          500
        );
      }

      if (password !== envPassword) {
        return c.json({ success: false, message: "Invalid password" }, 401);
      }

      // Create admin record with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(schema.admin).values({ passwordHash: hashedPassword });
    } else {
      const isValid = await bcrypt.compare(
        password,
        adminRecord[0].passwordHash
      );
      if (!isValid) {
        return c.json({ success: false, message: "Invalid password" }, 401);
      }
    }

    // Generate cryptographically secure session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

    // Store session in database
    await db.insert(schema.sessions).values({
      token: sessionToken,
      expiresAt,
    });

    setCookie(c, COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "Lax",
    });

    return c.json({ success: true, message: "Login successful" }, 200);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, message: "Login failed" }, 500);
  }
});

// POST /auth/logout
auth.post("/logout", async (c) => {
  const token = getCookie(c, COOKIE_NAME);

  // Delete session from database if it exists
  if (token) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
  }

  deleteCookie(c, COOKIE_NAME, {
    path: "/",
    sameSite: "Lax",
  });
  return c.json({ success: true, message: "Logout successful" }, 200);
});

// GET /auth/check
auth.get("/check", async (c) => {
  const token = getCookie(c, COOKIE_NAME);

  if (!token) {
    return c.json(
      {
        success: false,
        data: { authenticated: false },
      },
      401
    );
  }

  // Validate session against database
  const session = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .limit(1);

  if (session.length === 0) {
    return c.json(
      {
        success: false,
        data: { authenticated: false },
      },
      401
    );
  }

  // Check if session has expired
  if (new Date(session[0].expiresAt) < new Date()) {
    // Clean up expired session
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
    return c.json(
      {
        success: false,
        data: { authenticated: false },
      },
      401
    );
  }

  return c.json(
    {
      success: true,
      data: { authenticated: true },
    },
    200
  );
});

export default auth;
