import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { analysesTable } from "./analyses";

export const feedbackTable = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  analysisId: integer("analysis_id").notNull().references(() => analysesTable.id),
  correct: integer("correct", { mode: 'boolean' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;
