const TRUSTED_DOMAINS = new Set([
  "bbc.com", "bbc.co.uk", "reuters.com", "apnews.com", "npr.org",
  "nytimes.com", "washingtonpost.com", "theguardian.com", "economist.com",
  "wsj.com", "bloomberg.com", "ft.com", "nature.com", "science.org",
  "scientificamerican.com", "who.int", "cdc.gov", "nih.gov", "gov.uk",
  "europa.eu", "un.org", "snopes.com", "factcheck.org", "politifact.com",
  "abc.net.au", "cbsnews.com", "nbcnews.com", "abcnews.go.com",
  "pbs.org", "time.com", "theatlantic.com", "newyorker.com",
  "usatoday.com", "latimes.com", "chicagotribune.com",
]);

const UNTRUSTED_DOMAINS = new Set([
  "infowars.com", "naturalnews.com", "breitbart.com", "dailystormer.com",
  "theonion.com", "worldnewsdailyreport.com", "empirenews.net",
  "nationalreport.net", "huzlers.com", "thespoof.com", "clickhole.com",
  "abcnews.com.co", "cbsnews.com.co", "thepoliticalinsider.com",
  "americannews.com", "beforeitsnews.com", "yournewswire.com",
  "newslo.com", "thefreepatriot.org",
]);

export interface CredibilityResult {
  domain: string | null;
  score: number;
  label: "Trusted" | "Untrusted" | "Unknown";
}

export function checkCredibility(url: string | null | undefined): CredibilityResult {
  if (!url) {
    return { domain: null, score: 50, label: "Unknown" };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (TRUSTED_DOMAINS.has(hostname)) {
      return { domain: hostname, score: 90, label: "Trusted" };
    }

    if (UNTRUSTED_DOMAINS.has(hostname)) {
      return { domain: hostname, score: 10, label: "Untrusted" };
    }

    // Heuristic scoring
    let score = 50;

    // Government or educational domains
    if (hostname.endsWith(".gov") || hostname.endsWith(".edu") || hostname.endsWith(".ac.uk")) {
      score = 85;
    } else if (hostname.endsWith(".org")) {
      score = 65;
    } else if (hostname.endsWith(".net") || hostname.endsWith(".info")) {
      score = 40;
    }

    // Subdomain tricks (e.g. abcnews.com.co)
    if ((hostname.match(/\./g) || []).length > 2) {
      score -= 20;
    }

    score = Math.max(0, Math.min(100, score));
    const label: "Trusted" | "Untrusted" | "Unknown" =
      score >= 70 ? "Trusted" : score <= 30 ? "Untrusted" : "Unknown";

    return { domain: hostname, score, label };
  } catch {
    return { domain: null, score: 50, label: "Unknown" };
  }
}
