import "server-only";
import {
  ROUTE_OPPORTUNITY_TYPE_LABELS,
  suggestRouteIdFromText,
  type OpportunitySourceType,
} from "@/lib/opportunitySchema";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESULTS_PER_QUERY = 5;
const MAX_CANDIDATES = 18;

// Same policy as app/api/ingest-opportunity/route.ts: Instagram/Facebook are
// a discovery signal at most, never a source Pathoro reads or searches for
// structured details from.
const EXCLUDED_DOMAINS = ["instagram.com", "facebook.com", "fb.com", "fb.watch"];

const ROUTE_QUERY_HINTS: Record<string, string[]> = {
  "real-openings": ["beginner class", "public workshop"],
  community: ["community group", "local meetup"],
  people: ["mentor conversation", "info session"],
  requirements: ["getting started guide", "certification workshop"],
  "try-it": ["trial session", "one-time intro workshop"],
};

const CANONICAL_HOST_SOURCE_TYPES: { match: (host: string) => boolean; type: OpportunitySourceType }[] = [
  { match: (h) => h.includes("eventbrite."), type: "eventbrite" },
  { match: (h) => h.includes("lu.ma") || h.includes("luma."), type: "luma" },
  { match: (h) => h.includes("library"), type: "library" },
  { match: (h) => h.endsWith(".edu") || h.includes("university") || h.includes("college"), type: "university" },
  { match: (h) => h.includes("volunteer"), type: "volunteer_board" },
  { match: (h) => h.includes("coworking") || h.includes("makerspace"), type: "coworking" },
  { match: (h) => h.includes("parksandrec") || h.includes("parks-and-rec") || h.includes("parksrec"), type: "parks_rec" },
  { match: (h) => h.includes("newsletter") || h.includes("substack."), type: "newsletter" },
  { match: (h) => h.includes("community") || h.includes("centre") || h.includes("center"), type: "community_center" },
];

export type ScoutConfidence = "low" | "medium" | "high";

export type ScoutCandidate = {
  title: string;
  url: string;
  sourceName: string;
  snippet: string;
  likelyRouteId: string;
  whyThisMayFit: string;
  opportunityType: string;
  confidence: ScoutConfidence;
  sourceType: OpportunitySourceType;
  canonicalSourceLikely: boolean;
};

type TavilyResult = {
  title?: string;
  url: string;
  content?: string;
  score?: number;
};

export function isTavilyConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY);
}

/** Builds 4-6 route-aware, canonical-source-biased search queries. */
export function generateSearchQueries(params: {
  city: string;
  state?: string;
  pathGoal: string;
  routeId: string;
  keywords?: string;
}): string[] {
  const location = params.state ? `${params.city}, ${params.state}` : params.city;
  const hints = ROUTE_QUERY_HINTS[params.routeId] ?? ROUTE_QUERY_HINTS["real-openings"];

  const queries = [
    `${params.pathGoal} ${hints[0]} ${location}`,
    `${params.pathGoal} ${hints[1]} ${location}`,
    `${params.pathGoal} eventbrite ${location}`,
    `${params.pathGoal} library OR community center ${location}`,
    `${params.pathGoal} volunteer opportunities ${location}`,
  ];

  if (params.keywords?.trim()) {
    queries.push(`${params.keywords.trim()} ${params.pathGoal} ${location}`);
  }

  return queries;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchTavily(query: string, apiKey: string): Promise<TavilyResult[]> {
  const res = await fetchWithTimeout(
    TAVILY_SEARCH_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: MAX_RESULTS_PER_QUERY,
        exclude_domains: EXCLUDED_DOMAINS,
      }),
    },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    throw new Error(`Tavily search failed with status ${res.status}`);
  }

  const data = (await res.json()) as { results?: TavilyResult[] };
  return data.results ?? [];
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isExcludedHost(hostname: string): boolean {
  return EXCLUDED_DOMAINS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`));
}

function prettifyHostname(hostname: string): string {
  const first = hostname.split(".")[0] || hostname;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function classifySourceType(hostname: string): OpportunitySourceType {
  const matched = CANONICAL_HOST_SOURCE_TYPES.find(({ match }) => match(hostname));
  return matched?.type ?? "direct_submission";
}

function looksCanonical(hostname: string, sourceType: OpportunitySourceType, url: string): boolean {
  if (sourceType !== "direct_submission") return true;
  try {
    const path = new URL(url).pathname;
    return path.length > 1; // a real page, not just a bare homepage
  } catch {
    return false;
  }
}

/** Rule-based classification — reuses the same keyword logic as ingestion, no second AI call. */
function classifyResult(
  result: TavilyResult,
  query: string,
  requestedRouteId: string
): ScoutCandidate | null {
  const hostname = hostnameOf(result.url);
  if (!hostname || isExcludedHost(hostname)) return null;

  const title = result.title?.trim() || prettifyHostname(hostname);
  const snippet = (result.content ?? "").trim();
  const likelyRouteId = suggestRouteIdFromText(`${title} ${snippet}`);
  const sourceType = classifySourceType(hostname);
  const canonicalSourceLikely = looksCanonical(hostname, sourceType, result.url);
  const routeMatches = likelyRouteId === requestedRouteId;

  let confidence: ScoutConfidence = "low";
  if (canonicalSourceLikely && routeMatches) confidence = "high";
  else if (canonicalSourceLikely || routeMatches) confidence = "medium";
  if ((result.score ?? 0) > 0.7 && confidence === "low") confidence = "medium";

  return {
    title,
    url: result.url,
    sourceName: prettifyHostname(hostname),
    snippet,
    likelyRouteId,
    whyThisMayFit: `Matched "${query}" and reads as ${
      canonicalSourceLikely ? "a real, specific page" : "a possible lead"
    } rather than a generic listing.`,
    opportunityType: ROUTE_OPPORTUNITY_TYPE_LABELS[likelyRouteId] ?? "Class / Opening",
    confidence,
    sourceType,
    canonicalSourceLikely,
  };
}

export async function scoutOpportunities(params: {
  city: string;
  state?: string;
  pathGoal: string;
  routeId: string;
  keywords?: string;
}): Promise<{ candidates: ScoutCandidate[]; queriesUsed: string[] }> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY isn't configured. Add it to your environment — see docs/V0.11-AI-OPPORTUNITY-SCOUT.md."
    );
  }

  const queries = generateSearchQueries(params);

  const resultsByQuery = await Promise.all(
    queries.map(async (query) => {
      try {
        return await searchTavily(query, apiKey);
      } catch (err) {
        console.error(`Tavily query failed: "${query}"`, err);
        return [];
      }
    })
  );

  const seen = new Set<string>();
  const candidates: ScoutCandidate[] = [];

  resultsByQuery.forEach((results, i) => {
    for (const result of results) {
      if (!result.url || seen.has(result.url)) continue;
      const candidate = classifyResult(result, queries[i], params.routeId);
      if (!candidate) continue;
      seen.add(result.url);
      candidates.push(candidate);
    }
  });

  candidates.sort((a, b) => {
    const rank: Record<ScoutConfidence, number> = { high: 2, medium: 1, low: 0 };
    return rank[b.confidence] - rank[a.confidence];
  });

  return { candidates: candidates.slice(0, MAX_CANDIDATES), queriesUsed: queries };
}
