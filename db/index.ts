import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  maxIdle: 5,
  idleTimeout: 60000,
});

export const db = drizzle(pool, { schema, mode: "default" });

export { schema };
