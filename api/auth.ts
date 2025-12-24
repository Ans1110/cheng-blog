import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { loginRateLimiter } from "./middleware/rateLimiter";
import { loginSchema } from "@/utils/validation";
import { db, schema } from "@/db";
import bcrypt from "bcryptjs";

const auth = new Hono();

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// POST /auth/login
auth.post("/login", loginRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return c.json({ success: false, message: firstIssue.message }, 400);
    }

    const { password } = parsed.data;

    const adminRecord = await db.select().from(schema.admin).limit(1);

    if (adminRecord.length === 0) {
      //no admin record, check env
      const envPassword = process.env.ADMIN_PASSWORD;
      if (!envPassword)
        return c.json(
          {
            success: false,
            message: "Admin password not set in environment variables",
          },
          500
        );

      if (password !== envPassword)
        return c.json({ success: false, message: "Invalid password" }, 401);

      //create admin record with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(schema.admin).values({ passwordHash: hashedPassword });
    } else {
      const isVaild = await bcrypt.compare(
        password,
        adminRecord[0].passwordHash
      );
      if (!isVaild)
        return c.json({ success: false, message: "Invalid password" }, 401);
    }

    const secret = process.env.COOKIE_SECRET || "default_secret";
    const sessionToken = await bcrypt.hash(secret + Date.now(), 10);

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
  deleteCookie(c, COOKIE_NAME, {
    path: "/",
    sameSite: "Lax",
  });
  return c.json({ success: true, message: "Logout successful" }, 200);
});

//GET /auth/check
auth.get("check", async (c) => {
  const session = getCookie(c, COOKIE_NAME);

  if (!session)
    return c.json(
      {
        success: false,
        data: { authenticated: false },
      },
      401
    );

  return c.json(
    {
      success: true,
      data: { authenticated: true },
    },
    200
  );
});

export default auth;
