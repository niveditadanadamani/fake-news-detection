import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = sqliteTable("analyses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inputText: text("input_text").notNull(),
  sourceUrl: text("source_url"),
  sourceDomain: text("source_domain"),
  prediction: text("prediction").notNull(),
  confidence: real("confidence").notNull(),
  reasons: text("reasons", { mode: 'json' }).$type<string[]>().notNull().default([]),
  suspiciousWords: text("suspicious_words", { mode: 'json' }).$type<string[]>().notNull().default([]),
  sourceCredibilityScore: real("source_credibility_score").notNull().default(50),
  sourceCredibilityLabel: text("source_credibility_label").notNull().default("Unknown"),
  feedbackCorrect: integer("feedback_correct", { mode: 'boolean' }),
  imageUrl: text("image_url"),
  factualContext: text("factual_context"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
