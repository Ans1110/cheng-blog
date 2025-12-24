import { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}, 10 * 60 * 1000);

const getClientIP = (c: Context): string => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
};

export const rateLimiter = (options: RateLimiterOptions) => {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later",
  } = options;

  return async (c: Context, next: Next) => {
    const clientIP = getClientIP(c);
    const key = `${clientIP}:${c.req.path}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      entry = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    const remaining = Math.max(0, max - entry.count);
    c.header("X-RateLimit-Limit", max.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header("X-RateLimit-Reset", entry.resetAt.toString());

    if (entry.count > max) {
      c.header(
        "Retry-After",
        Math.ceil((entry.resetAt - now) / 1000).toString()
      );
      return c.json({ success: false, message }, 429);
    }

    await next();
  };
};

// Pre-configured rate limiters for different use cases
export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: "Too many login attempts, please try again in 15 minutes",
});

export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10, // 10 uploads per minute
  message: "Too many uploads, please try again later",
});

export const mutationRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 30, // 30 mutations per minute
  message: "Too many requests, please slow down",
});
