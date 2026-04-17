const SUSPICIOUS_WORDS = [
  "shocking", "unbelievable", "100% cure", "miracle", "secret", "they don't want you to know",
  "government confirms", "breaking", "exposed", "conspiracy", "hoax", "fraud", "banned",
  "explosive", "bombshell", "urgent", "alert", "must read", "share before deleted",
  "mainstream media won't tell you", "big pharma", "deep state", "wake up", "sheeple",
  "absolute proof", "undeniable", "slam dunk", "end times", "apocalypse", "finally revealed",
  "scientists baffled", "doctors hate this", "simple trick", "overnight", "instant",
  "guaranteed", "100%", "never before seen", "mind blowing", "jaw dropping",
  "cures all", "cures everything", "kills instantly", "world exclusive",
];

const CLICKBAIT_PATTERNS = [
  /\d+ reasons why/i,
  /you won't believe/i,
  /what happens next will/i,
  /one weird trick/i,
  /doctors hate/i,
  /this is why/i,
  /here's what/i,
  /nobody talks about/i,
  /they're hiding/i,
  /the truth about/i,
];

const MEDICAL_MISINFORMATION_PATTERNS = [
  /cures? (all|every|cancer|diabetes|covid|hiv|aids)/i,
  /100% (effective|cure|guaranteed)/i,
  /drinking .* cures/i,
  /eating .* prevents/i,
  /kills? (all|cancer|virus) instantly/i,
];

const POLITICAL_EXAGGERATION_PATTERNS = [
  /government (confirms|admits|reveals|confesses)/i,
  /president (secretly|admits|confirms)/i,
  /(cia|fbi|nsa) (cover.?up|hiding|suppressing)/i,
];

export interface AnalysisOutput {
  prediction: "Fake" | "Real";
  confidence: number;
  reasons: string[];
  suspiciousWords: string[];
}

export async function analyzeText(text: string): Promise<AnalysisOutput> {
  const lowerText = text.toLowerCase();
  const reasons: string[] = [];
  const foundSuspicious: string[] = [];
  let factScore = 100; // Start with perfect fact score, reduce if unmatched
  let styleScore = 0;  // Start with 0 penalty, increase if sensational
  let imageUrl: string | null = null;
  let factualContext: string | null = null;

  // 1. Stylistic Analysis
  for (const word of SUSPICIOUS_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      foundSuspicious.push(word);
      styleScore += 8;
    }
  }

  if (foundSuspicious.length > 0) {
    reasons.push(`Contains ${foundSuspicious.length} suspicious/clickbait word(s)`);
  }

  for (const pattern of CLICKBAIT_PATTERNS) {
    if (pattern.test(text)) {
      styleScore += 12;
      reasons.push("Clickbait headline structure detected");
      break; 
    }
  }

  const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
  if (capsWords.length > 2) {
    styleScore += 10;
    reasons.push("Excessive use of capital letters (sensationalism)");
  }

  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 2) {
    styleScore += 8;
    reasons.push("Excessive exclamation marks (emotional manipulation)");
  }

  // 2. Factual Analysis (Wikipedia Heuristic)
  try {
    const searchStr = text.slice(0, 100).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').trim();
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchStr)}&prop=pageimages|extracts&exsentences=1&exintro=1&explaintext=1&pithumbsize=500&format=json&origin=*`;
    
    const res = await fetch(wikiUrl);
    const data = await res.json() as any;

    if (data?.query?.pages) {
      const pages = Object.values(data.query.pages);
      const firstHit = pages.find((p: any) => p.index === 1) || pages[0];
      
      if (firstHit) {
        factualContext = (firstHit as any).extract || null;
        const hitTitle = (firstHit as any).title;
        
        const normalize = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
        const hitText = normalize(hitTitle + " " + (factualContext || ""));
        const normalizedInput = normalize(text.slice(0, 300));
        
        const inputWords = normalizedInput.match(/\b(\w{3,}|\d+)\b/g) || [];
        const inputNumbers = normalizedInput.match(/\d+/g) || [];
        const hitNumbers = hitText.match(/\d+/g) || [];
        
        const numbersConsistent = inputNumbers.length === 0 || inputNumbers.every(n => hitNumbers.includes(n));
        
        const hasMatch = inputWords.some(w => {
          if (!isNaN(Number(w))) return hitNumbers.includes(w);
          return hitText.includes(w);
        });

        if (hasMatch && numbersConsistent) {
          reasons.push(`Information corroborated by reliable source: "${hitTitle}"`);
          factScore = 100;
          if ((firstHit as any).thumbnail) {
            imageUrl = (firstHit as any).thumbnail.source;
          }
        } else if (inputNumbers.length > 0 && !numbersConsistent) {
          reasons.push("Numeric data inconsistency detected (potential sequel/version mismatch)");
          factScore = 10;
        } else {
          reasons.push("Limited corroboration found in knowledge base");
          factScore = 40;
        }
      }
    } else {
      reasons.push("No trusted encyclopedic sources match this claim");
      factScore = 30;
    }
  } catch (err) {
    reasons.push("Factual verification service temporarily unavailable");
    factScore = 50; // Neutral if service fails
  }

  // 3. Score Aggregation
  // compositeScore: 60% Factual, 40% Stylistic (inverted)
  const normalizedStyleScore = Math.max(0, 100 - styleScore);
  const compositeScore = (factScore * 0.6) + (normalizedStyleScore * 0.4);

  const isFake = compositeScore < 50;

  return {
    prediction: isFake ? "Fake" : "Real",
    confidence: isFake ? Math.round(100 - compositeScore) : Math.round(compositeScore),
    reasons,
    suspiciousWords: foundSuspicious,
    imageUrl,
    factualContext,
    styleScore: Math.round(normalizedStyleScore),
    factScore: Math.round(factScore),
  } as any;
}
