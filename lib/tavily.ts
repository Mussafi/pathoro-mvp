import "server-only";
import {
  ROUTE_OPPORTUNITY_TYPE_LABELS,
  suggestRouteIdFromText,
  type OpportunityCategory,
  type OpportunitySourceType,
} from "@/lib/opportunitySchema";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESULTS_PER_QUERY = 5;
const MAX_CANDIDATES = 18;

// Same policy as app/api/ingest-opportunity/route.ts: Instagram/Facebook are
// a discovery signal at most, never a source Pathoro reads or searches for
// structured details from. Reddit is excluded here too (v0.11 constraint) —
// the future Reddit *signal* layer is a deliberate, separate feature
// (see docs/V0.9-DISCOVERY-SOURCES.md), not something the scout does today.
const EXCLUDED_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "fb.watch",
  "reddit.com",
  "redd.it",
];

const ROUTE_QUERY_HINTS: Record<string, string[]> = {
  "real-openings": ["beginner class", "public workshop"],
  community: ["community group", "local meetup"],
  people: ["mentor conversation", "info session"],
  requirements: ["getting started guide", "certification workshop"],
  "try-it": ["trial session", "one-time intro workshop"],
};

/**
 * Higher-agency opportunity types — flea markets, resale, grants,
 * apprenticeships — not classes/events. See "Opportunity, not consumption"
 * in docs/MVP-LOCKED-PRINCIPLES.md: a goal like "build wealth" or "find
 * opportunities" should not just return a list of paid classes. Two of
 * these are mixed into every search, rotated by route so different routes
 * don't always get the same pair.
 */
const OPPORTUNITY_ACCESS_HINTS = [
  "flea market vendor opportunity",
  "estate sale OR liquidation auction",
  "vendor market application",
  "small business grant OR entrepreneur program",
  "makerspace open shop night",
  "apprenticeship OR shadowing opportunity",
  "local resale OR side hustle opportunity",
];

/**
 * Signals that a path/goal is reaching for a wider network — trade,
 * sourcing, a diaspora connection, entering a new community — not a single
 * opportunity. Deliberately structure-based (matches words describing what
 * the *admin typed*), never identity-based: it does not name or infer any
 * specific ethnicity, culture, or community. See "Gateway Communities" in
 * docs/MVP-LOCKED-PRINCIPLES.md.
 */
const GATEWAY_TRIGGER_PATTERN =
  /\b(import|export|trade|sourcing|wholesale|resell|diaspora|chamber of commerce|cultural association|connect with|business network|new community|bridge (?:person|community)|international)\b/i;

/** Institution-type query hints for gateway community search mode — never a specific culture/ethnicity. */
const GATEWAY_QUERY_HINTS = [
  "local chamber of commerce",
  "cultural association",
  "business improvement district",
  "language exchange group",
  "import export workshop",
  "sourcing OR import community",
  "trade meetup",
  "small business development center",
  "community business directory",
  "neighborhood organization",
];

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
  opportunityCategory: OpportunityCategory;
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

/**
 * Builds a blend of search queries: route-type-biased, canonical-source-
 * biased, and higher-agency-opportunity-biased (flea markets, grants,
 * apprenticeships, resale, etc.) — so results aren't dominated by classes
 * and events. See "Opportunity, not consumption" in
 * docs/MVP-LOCKED-PRINCIPLES.md. If the path/goal signals interest in a
 * wider network (trade, sourcing, diaspora, entering a new community), also
 * adds gateway community queries — see "Gateway Communities" in the same
 * doc.
 */
export function generateSearchQueries(params: {
  city: string;
  state?: string;
  pathGoal: string;
  routeId: string;
  keywords?: string;
}): string[] {
  const location = params.state ? `${params.city}, ${params.state}` : params.city;
  const hints = ROUTE_QUERY_HINTS[params.routeId] ?? ROUTE_QUERY_HINTS["real-openings"];

  const routeKeys = Object.keys(ROUTE_QUERY_HINTS);
  const routeIndex = Math.max(routeKeys.indexOf(params.routeId), 0);
  const accessHintA = OPPORTUNITY_ACCESS_HINTS[routeIndex % OPPORTUNITY_ACCESS_HINTS.length];
  const accessHintB =
    OPPORTUNITY_ACCESS_HINTS[(routeIndex + 3) % OPPORTUNITY_ACCESS_HINTS.length];

  const queries = [
    `${params.pathGoal} ${hints[0]} ${location}`,
    `${params.pathGoal} ${hints[1]} ${location}`,
    `${params.pathGoal} eventbrite ${location}`,
    `${params.pathGoal} library OR community center ${location}`,
    `${params.pathGoal} volunteer opportunities ${location}`,
    `${params.pathGoal} ${accessHintA} ${location}`,
    `${params.pathGoal} ${accessHintB} ${location}`,
  ];

  if (GATEWAY_TRIGGER_PATTERN.test(params.pathGoal)) {
    const gatewayHintA = GATEWAY_QUERY_HINTS[routeIndex % GATEWAY_QUERY_HINTS.length];
    const gatewayHintB = GATEWAY_QUERY_HINTS[(routeIndex + 5) % GATEWAY_QUERY_HINTS.length];
    queries.push(
      `${params.pathGoal} ${gatewayHintA} ${location}`,
      `${params.pathGoal} ${gatewayHintB} ${location}`
    );
  }

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: MAX_RESULTS_PER_QUERY,
        exclude_domains: EXCLUDED_DOMAINS,
      }),
    },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Tavily search failed with status ${res.status}${detail ? `: ${detail}` : ""}`);
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

// Priority order matters: checked top to bottom, first match wins. Highest-
// agency, most-specific categories first; "skill_building" and the
// "consumer_activity" fallback are deliberately last, so a class that's
// also an apprenticeship or a grant-funded program gets credited for that
// instead of being flattened into "just a class."
const CATEGORY_KEYWORD_RULES: { category: OpportunityCategory; pattern: RegExp }[] = [
  {
    category: "income_generating",
    pattern: /\b(resell(?:ing|er)?|flea market|estate sale|liquidation|thrift (?:store |shop )?arbitrage|consignment|vendor market|side hustle|sell your)\b/,
  },
  {
    category: "ownership_path",
    pattern: /\b(small business grant|start(?:ing)? your (?:own )?business|entrepreneur(?:ship)?|business plan competition|storefront|launch your business)\b/,
  },
  // Gateway community values ("Gateway Communities" in
  // docs/MVP-LOCKED-PRINCIPLES.md) — institution-type patterns only, never
  // a specific ethnicity or culture, matching what the admin actually typed.
  {
    category: "trade_access_point",
    pattern: /\b(import\/?export|sourcing|wholesale|trade meetup|trade association|trade show)\b/,
  },
  {
    category: "diaspora_route",
    pattern: /\b(diaspora|immigrant business|ethnic chamber|international trade)\b/,
  },
  {
    category: "gateway_community",
    pattern: /\b(chamber of commerce|cultural association|business improvement district)\b/,
  },
  {
    category: "bridge_person",
    pattern: /\b(bridge (?:person|builder)|community liaison|connector)\b/,
  },
  {
    category: "place_based_network",
    pattern: /\b(neighborhood organization|business corridor|neighborhood association)\b/,
  },
  {
    category: "relationship_path",
    pattern: /\b(language exchange|build(?:ing)? trust|long-?term relationship)\b/,
  },
  {
    category: "access_point",
    pattern: /\b(open shop night|makerspace|open studio night|member night|shadowing|apprenticeship)\b/,
  },
  {
    category: "proximity_builder",
    pattern: /\b(volunteer|board member|committee member|networking event)\b/,
  },
  {
    category: "credential_step",
    pattern: /\b(certification|certificate program|license|credential|bootcamp|training program)\b/,
  },
  {
    category: "community_entry",
    pattern: /\b(join(?:ing)? (?:a|the) (?:group|club)|community organization|membership|chapter meeting)\b/,
  },
  {
    category: "compounding_opportunity",
    pattern: /\b(recurring|ongoing series|multi-week|cohort|accelerator|incubator)\b/,
  },
  {
    category: "skill_building",
    pattern: /\b(class|workshop|course|training|lesson)\b/,
  },
];

/** Rule-based "Opportunity, not consumption" classification — no AI call. */
function classifyOpportunityCategory(title: string, snippet: string): OpportunityCategory {
  const text = `${title} ${snippet}`.toLowerCase();
  const matched = CATEGORY_KEYWORD_RULES.find(({ pattern }) => pattern.test(text));
  return matched?.category ?? "consumer_activity";
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
    opportunityCategory: classifyOpportunityCategory(title, snippet),
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
