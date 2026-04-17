import { Router, type IRouter } from "express";
import { db, analysesTable, feedbackTable } from "@workspace/db";
import {
  GetHistoryQueryParams,
  GetHistoryItemParams,
  SubmitFeedbackBody,
} from "@workspace/api-zod";
import { desc, count, eq, avg, sql } from "drizzle-orm";

const router: IRouter = Router();

function toRecord(row: typeof analysesTable.$inferSelect) {
  return {
    id: row.id,
    prediction: row.prediction,
    confidence: row.confidence,
    reasons: row.reasons ?? [],
    suspiciousWords: row.suspiciousWords ?? [],
    sourceUrl: row.sourceUrl ?? null,
    sourceDomain: row.sourceDomain ?? null,
    sourceCredibilityScore: row.sourceCredibilityScore,
    sourceCredibilityLabel: row.sourceCredibilityLabel,
    inputText: row.inputText,
    feedbackCorrect: row.feedbackCorrect ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/history", async (req, res): Promise<void> => {
  const parsed = GetHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, offset = 0 } = parsed.data;

  const [items, totalResult] = await Promise.all([
    db.select().from(analysesTable).orderBy(desc(analysesTable.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(analysesTable),
  ]);

  res.json({
    items: items.map(toRecord),
    total: totalResult[0]?.total ?? 0,
  });
});

router.get("/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetHistoryItemParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [record] = await db.select().from(analysesTable).where(eq(analysesTable.id, params.data.id));

  if (!record) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json(toRecord(record));
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { analysisId, correct } = parsed.data;

  const [analysis] = await db.select().from(analysesTable).where(eq(analysesTable.id, analysisId));
  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  await db.update(analysesTable).set({ feedbackCorrect: correct }).where(eq(analysesTable.id, analysisId));

  const [feedback] = await db
    .insert(feedbackTable)
    .values({ analysisId, correct })
    .returning();

  req.log.info({ analysisId, correct }, "Feedback submitted");

  res.status(201).json({
    id: feedback.id,
    analysisId: feedback.analysisId,
    correct: feedback.correct,
    createdAt: feedback.createdAt.toISOString(),
  });
});

router.get("/stats", async (_req, res): Promise<void> => {
  const [allStats, recentItems] = await Promise.all([
    db.select({
      total: count(),
      fakeCount: sql<number>`SUM(CASE WHEN prediction = 'Fake' THEN 1 ELSE 0 END)::int`,
      realCount: sql<number>`SUM(CASE WHEN prediction = 'Real' THEN 1 ELSE 0 END)::int`,
      avgConfidence: avg(analysesTable.confidence),
      correctFeedback: sql<number>`SUM(CASE WHEN feedback_correct = true THEN 1 ELSE 0 END)::int`,
      totalFeedback: sql<number>`SUM(CASE WHEN feedback_correct IS NOT NULL THEN 1 ELSE 0 END)::int`,
    }).from(analysesTable),
    db.select().from(analysesTable).orderBy(desc(analysesTable.createdAt)).limit(5),
  ]);

  const stats = allStats[0];
  const totalFeedback = stats?.totalFeedback ?? 0;
  const correctFeedback = stats?.correctFeedback ?? 0;
  const accuracyFromFeedback = totalFeedback > 0 ? (correctFeedback / totalFeedback) * 100 : null;

  res.json({
    totalAnalyzed: stats?.total ?? 0,
    fakeCount: stats?.fakeCount ?? 0,
    realCount: stats?.realCount ?? 0,
    avgConfidence: stats?.avgConfidence ? Number(stats.avgConfidence) : 0,
    accuracyFromFeedback,
    recentActivity: recentItems.map((row) => ({
      id: row.id,
      prediction: row.prediction,
      confidence: row.confidence,
      reasons: row.reasons ?? [],
      suspiciousWords: row.suspiciousWords ?? [],
      sourceUrl: row.sourceUrl ?? null,
      sourceDomain: row.sourceDomain ?? null,
      sourceCredibilityScore: row.sourceCredibilityScore,
      sourceCredibilityLabel: row.sourceCredibilityLabel,
      inputText: row.inputText,
      feedbackCorrect: row.feedbackCorrect ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  });
});

export default router;
