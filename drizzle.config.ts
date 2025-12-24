import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envPath = resolve(process.cwd(), ".env");
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line: string) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  });
} catch (error) {
  // .env might not exist, that's okay
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT)
      : 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "cheng_blog",
  },
});
