import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Use a local SQLite database file in the project root
export const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

export * from "./schema";
