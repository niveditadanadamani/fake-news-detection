import { Router, type IRouter } from "express";
import { db, analysesTable } from "@workspace/db";
import { AnalyzeTextBody, AnalyzeUrlBody } from "@workspace/api-zod";
import { analyzeText } from "../lib/analyzer";
import { checkCredibility } from "../lib/credibility";
import { desc, count, eq, avg } from "drizzle-orm";

const router: IRouter = Router();

router.post("/analyze/text", async (req, res): Promise<void> => {
  const parsed = AnalyzeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, sourceUrl } = parsed.data;
  const analysis = await analyzeText(text);
  const credibility = checkCredibility(sourceUrl);

  const [record] = await db
    .insert(analysesTable)
    .values({
      inputText: text,
      sourceUrl: sourceUrl ?? null,
      sourceDomain: credibility.domain,
      prediction: analysis.prediction,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
      suspiciousWords: analysis.suspiciousWords,
      imageUrl: analysis.imageUrl,
      factualContext: analysis.factualContext,
      sourceCredibilityScore: credibility.score,
      sourceCredibilityLabel: credibility.label,
    })
    .returning();

  req.log.info({ id: record.id, prediction: analysis.prediction }, "Text analyzed");

  res.json({
    id: record.id,
    prediction: analysis.prediction,
    confidence: analysis.confidence,
    reasons: analysis.reasons,
    suspiciousWords: analysis.suspiciousWords,
    sourceCredibility: {
      domain: credibility.domain,
      score: credibility.score,
      label: credibility.label,
    },
    inputText: text,
    sourceUrl: sourceUrl ?? null,
    imageUrl: analysis.imageUrl,
    factualContext: analysis.factualContext,
    analyzedAt: record.createdAt.toISOString(),
  });
});

router.post("/analyze/url", async (req, res): Promise<void> => {
  const parsed = AnalyzeUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url } = parsed.data;
  let text = "";

  try {
    const fetchRes = await fetch(url, {
      headers: { "User-Agent": "FakeNewsDetector/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await fetchRes.text();

    // Extract text content from HTML by stripping tags
    text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    if (!text) {
      res.status(400).json({ error: "Could not extract text from URL" });
      return;
    }
  } catch (err) {
    req.log.warn({ url, err }, "Failed to fetch URL");
    res.status(400).json({ error: "Failed to fetch content from URL. The site may be unavailable or blocking requests." });
    return;
  }

  const analysis = await analyzeText(text);
  const credibility = checkCredibility(url);

  const [record] = await db
    .insert(analysesTable)
    .values({
      inputText: text.slice(0, 2000),
      sourceUrl: url,
      sourceDomain: credibility.domain,
      prediction: analysis.prediction,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
      suspiciousWords: analysis.suspiciousWords,
      imageUrl: analysis.imageUrl,
      factualContext: analysis.factualContext,
      sourceCredibilityScore: credibility.score,
      sourceCredibilityLabel: credibility.label,
    })
    .returning();

  req.log.info({ id: record.id, url, prediction: analysis.prediction }, "URL analyzed");

  res.json({
    id: record.id,
    prediction: analysis.prediction,
    confidence: analysis.confidence,
    reasons: analysis.reasons,
    suspiciousWords: analysis.suspiciousWords,
    sourceCredibility: {
      domain: credibility.domain,
      score: credibility.score,
      label: credibility.label,
    },
    inputText: text.slice(0, 500),
    sourceUrl: url,
    imageUrl: analysis.imageUrl,
    factualContext: analysis.factualContext,
    analyzedAt: record.createdAt.toISOString(),
  });
});

export default router;
