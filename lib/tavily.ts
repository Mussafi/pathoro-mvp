import "server-only";
import {
  ROUTE_OPPORTUNITY_TYPE_LABELS,
  suggestRouteIdFromText,
  type OpportunityCategory,
  type OpportunitySourceType,
} from "@/lib/opportunitySchema";
import { PATHORO_FIT_RANK, type PathoroFit } from "@/lib/scoutFit";
import { computeGoalFit, GOAL_FIT_RANK } from "@/lib/goalFitLabel";
import {
  computePrerequisiteSignal,
  computeStartingPointFit,
  mapStartingFromToExperienceLevel,
  STARTING_POINT_FIT_RANK,
  type ExperienceLevel,
} from "@/lib/startingPointFit";

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
 * these are mixed into every "route" mode search, rotated by route so
 * different routes don't always get the same pair.
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
 * The full "hidden opportunity / leverage scout" mode (v0.12) query pool —
 * every query in this mode is drawn from here, no class/workshop or
 * route-type phrasing at all. See "the modern opportunity problem is not
 * just finding events" in docs/MVP-LOCKED-PRINCIPLES.md.
 */
const HIDDEN_OPPORTUNITY_HINTS = [
  "resale OR arbitrage opportunity",
  "flea market vendor opportunity",
  "estate sale OR liquidation auction",
  "thrift store sourcing",
  "vendor market application",
  "makerspace open shop night",
  "repair OR refurbishing drop-off",
  "apprenticeship OR shadowing opportunity",
  "small business grant OR entrepreneur program",
  "local business gap OR unmet need",
  "import export sourcing community",
  "wholesale supplier directory",
  "coworking OR founder meetup",
  "side hustle entry point",
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

// Hosts that are almost never a specific, takeable opportunity themselves —
// review/directory/listicle aggregators. Seeing one of these means the
// result is a page *about* many things, not one specific thing to do.
const WEAK_HOST_PATTERNS = [
  "yelp.",
  "tripadvisor.",
  "opentable.",
  "thrillist.",
  "timeout.",
  "eater.",
  "yellowpages.",
  "manta.com",
  "bbb.org",
  "angi.com",
  "nextdoor.com",
  "pinterest.",
  "quora.com",
  "wikipedia.org",
  "chamberofcommerce.com",
];

const LISTICLE_TITLE_PATTERN =
  /\b(top\s*\d+|\d+\s+best\b|best\s+(?:\d+\s+)?[a-z\s]{0,24}(restaurants|places|spots|things to do|cafes|eats))\b/i;

const RESTAURANT_ARTICLE_PATTERN =
  /\b(best restaurants|top restaurants|where to eat|restaurant guide|dining guide|food guide)\b/i;

const ERROR_OR_BOILERPLATE_PATTERN =
  /\b(enable javascript|enable cookies|please wait while|loading\.{2,}|page not found|404 (?:error|not found)|access denied|verify you are human|are you a robot|browser (?:is )?(?:out of date|not supported)|using an old browser|internet connection seems to be having issues)\b/i;

const NEXT_ACTION_PATTERN =
  /\b(register|sign[\s-]?up|rsvp|apply now|application|volunteer|join (?:us|the|now)|enroll|get tickets|buy tickets|reserve your spot|reserve a spot|book now|book your|attend|donate)\b/i;

const DATE_OR_TIME_PATTERN =
  /\b(\d{1,2}:\d{2}\s*(am|pm)|(mon|tue|wed|thu|fri|sat|sun)[a-z]*,?\s*\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

function safePathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

/** Eventbrite/Luma browse, category, or organizer pages — not one specific event. */
function isGenericBrowsePage(hostname: string, url: string): boolean {
  const path = safePathOf(url);
  if (hostname.includes("eventbrite.")) {
    return !/\/e\//.test(path);
  }
  if (hostname.includes("lu.ma") || hostname.startsWith("luma.")) {
    return path === "/" || path === "" || /\/discover/.test(path);
  }
  return false;
}

/**
 * Candidate quality gate — separate from route/category classification.
 * Flags results that are real web pages but weak Pathoro opportunities:
 * listicles, directories, generic browse pages, or pages with no clear next
 * action. Checked in priority order; first match wins so the fit reason
 * shown to the admin is the most specific one available.
 */
function isWeakResultPage(input: {
  hostname: string;
  url: string;
  title: string;
  snippet: string;
  hasNextAction: boolean;
  hasDateOrTime: boolean;
}): { weak: boolean; reason?: string } {
  const { hostname, url, title, snippet, hasNextAction, hasDateOrTime } = input;

  if (ERROR_OR_BOILERPLATE_PATTERN.test(snippet)) {
    return { weak: true, reason: "The page mostly shows loading/error boilerplate, not real content." };
  }
  if (WEAK_HOST_PATTERNS.some((h) => hostname.includes(h))) {
    return {
      weak: true,
      reason: "This looks more like a directory or review listing than a direct opportunity.",
    };
  }
  if (LISTICLE_TITLE_PATTERN.test(title)) {
    return {
      weak: true,
      reason: "This reads like a “best of” listicle, not one specific opportunity to take.",
    };
  }
  if (RESTAURANT_ARTICLE_PATTERN.test(title) && !hasNextAction) {
    return {
      weak: true,
      reason: "This reads like a restaurant recommendation article, not a specific opportunity to take.",
    };
  }
  if (isGenericBrowsePage(hostname, url)) {
    return {
      weak: true,
      reason: "This looks like a generic browse or category page, not one specific opportunity.",
    };
  }
  if (!hasNextAction && !hasDateOrTime) {
    return { weak: true, reason: "This looks more like an informational page than a direct opportunity." };
  }
  return { weak: false };
}

// Footer/boilerplate markers that show up verbatim on Eventbrite and
// similar organizer pages — once one of these appears, everything after it
// in the extracted text is site chrome, not opportunity content.
const SNIPPET_CUT_MARKERS = [
  "how do you want to get there",
  "refund policy",
  "more events from",
  "share this event",
  "follow this organizer",
  "report this event",
  "about the organizer",
  "sales have ended",
  "log in sign up",
  "tags:",
];

const SNIPPET_MAX_LENGTH = 220;

/** Caps length and strips known Eventbrite/organizer-page footer boilerplate. */
function cleanSnippet(raw: string): string {
  let text = raw.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  let cutIndex = text.length;
  for (const marker of SNIPPET_CUT_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx !== -1 && idx < cutIndex) cutIndex = idx;
  }
  text = text.slice(0, cutIndex).trim();

  if (text.length > SNIPPET_MAX_LENGTH) {
    const truncated = text.slice(0, SNIPPET_MAX_LENGTH);
    const lastSpace = truncated.lastIndexOf(" ");
    text = (lastSpace > SNIPPET_MAX_LENGTH * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
  }

  return text;
}

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

/** The three scout modes — see docs/V0.11-AI-OPPORTUNITY-SCOUT.md. */
export type ScoutMode = "route" | "hidden" | "gateway";

/** Wealth/income/business goals — use "hidden" mode so the scout searches
 * flea markets, resale, grants, apprenticeships instead of defaulting to
 * paid Eventbrite wealth seminars. See "the modern opportunity problem is
 * not just finding events" in docs/MVP-LOCKED-PRINCIPLES.md. */
const WEALTH_GOAL_PATTERN =
  /\b(wealth|money|income|business|side hustle|resell|resale|ebay|arbitrage|entrepreneur|startup|opportunity|cashflow|cash flow)\b/i;

/** Trade/sourcing/diaspora goals — use "gateway" mode so the scout searches
 * chambers of commerce, cultural associations, trade meetups. See "Gateway
 * Communities" in docs/MVP-LOCKED-PRINCIPLES.md. */
const GATEWAY_GOAL_PATTERN =
  /\b(china|import|export|sourcing|supplier|trade|diaspora|chinatown|international)\b/i;

/**
 * Infers which scout mode best fits a user's stated goal, for the
 * automatic scout run right after a public scout request is submitted
 * (POST /api/scout-requests) — there's no admin picking a mode by hand, so
 * the goal text itself has to decide.
 */
export function inferScoutMode(pathGoal: string): ScoutMode {
  if (WEALTH_GOAL_PATTERN.test(pathGoal)) return "hidden";
  if (GATEWAY_GOAL_PATTERN.test(pathGoal)) return "gateway";
  return "route";
}

export type ScoutConfidence = "low" | "medium" | "high";

export type ScoutCandidate = {
  title: string;
  url: string;
  sourceName: string;
  snippet: string;
  likelyRouteId: string;
  whyThisMayFit: string;
  leverageHint: string;
  suggestedNextStep: string;
  opportunityType: string;
  confidence: ScoutConfidence;
  sourceType: OpportunitySourceType;
  canonicalSourceLikely: boolean;
  opportunityCategory: OpportunityCategory;
  pathoroFit: PathoroFit;
  fitReason: string;
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

function pickRotatedHints(pool: string[], startIndex: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => pool[(startIndex + i) % pool.length]);
}

/**
 * Goal-specific query boosts for goals where the generic route hint pool
 * ("beginner class", "public workshop", …) is too vague to reliably
 * surface a *direct* access point — see "Fix opportunity action landing
 * and submission" PART 6. Matched by keyword against pathGoal; a match
 * APPENDS its queries on top of the generic route-mode queries below
 * rather than replacing them, so an unmatched goal still gets the exact
 * same coverage it always has.
 */
const GOAL_SPECIFIC_QUERY_BOOSTS: { pattern: RegExp; queries: string[] }[] = [
  {
    pattern: /\b(licensed therapist|therapist|counselor|counseling|lpc|lcsw|lmft|clinical mental health)\b/i,
    queries: [
      "counseling graduate program open house",
      "clinical mental health counseling info session",
      "therapist licensure workshop",
      "supervised clinical hours info session",
      "psychology OR counseling program admissions event",
    ],
  },
];

/**
 * Starting-position-aware query boosts — see "Rank opportunities by
 * starting point fit" PART 5. Only applied when the user says they're
 * new to this ("curious but unsure", "no experience", etc. — see
 * lib/startingPointFit.ts's mapStartingFromToExperienceLevel); someone
 * further along still gets the plain goal-specific/generic queries,
 * since a job posting or an experience-gated role is exactly what
 * they're looking for. Deliberately does NOT lead with "jobs" or
 * "journeyman"/"master" query terms, which is what was surfacing
 * experience-gated roles as the top (and often only) result before.
 */
const BEGINNER_QUERY_BOOSTS: { pattern: RegExp; queries: string[] }[] = [
  {
    pattern: /\belectrician\b|\belectrical\b/i,
    queries: [
      "electrician apprenticeship info session",
      "electrician pre-apprenticeship",
      "IBEW apprenticeship",
      "electrical helper no experience",
      "electrician trade school open house",
      "electrical apprenticeship application",
      "workforce training electrician",
    ],
  },
];

function goalSpecificQueries(pathGoal: string, location: string): string[] {
  const boost = GOAL_SPECIFIC_QUERY_BOOSTS.find((b) => b.pattern.test(pathGoal));
  return boost ? boost.queries.map((q) => `${q} ${location}`) : [];
}

function beginnerQueries(pathGoal: string, location: string, experienceLevel: ExperienceLevel): string[] {
  if (experienceLevel !== "new") return [];
  const boost = BEGINNER_QUERY_BOOSTS.find((b) => b.pattern.test(pathGoal));
  return boost ? boost.queries.map((q) => `${q} ${location}`) : [];
}

/**
 * Builds the search query set for whichever scout mode was selected — see
 * the three scout modes in docs/V0.11-AI-OPPORTUNITY-SCOUT.md:
 * - "route": route-type-biased + canonical-source-biased, with a light,
 *   rotated dose of higher-agency queries and an auto-detected gateway
 *   bonus. The original v0.11 behavior.
 * - "hidden": every query drawn from the hidden-opportunity hint pool
 *   (flea markets, resale, grants, apprenticeships, supplier directories,
 *   etc.) — no class/workshop phrasing. See "the modern opportunity
 *   problem is not just finding events" in docs/MVP-LOCKED-PRINCIPLES.md.
 * - "gateway": every query drawn from the gateway community hint pool
 *   (chambers of commerce, cultural associations, trade meetups, etc.),
 *   always on rather than keyword-triggered. See "Gateway Communities" in
 *   the same doc.
 */
export function generateSearchQueries(params: {
  city: string;
  state?: string;
  pathGoal: string;
  routeId: string;
  keywords?: string;
  scoutMode?: ScoutMode;
  startingFrom?: string;
}): string[] {
  const location = params.state ? `${params.city}, ${params.state}` : params.city;
  const routeKeys = Object.keys(ROUTE_QUERY_HINTS);
  const routeIndex = Math.max(routeKeys.indexOf(params.routeId), 0);
  const mode = params.scoutMode ?? "route";

  let queries: string[];

  if (mode === "hidden") {
    queries = pickRotatedHints(HIDDEN_OPPORTUNITY_HINTS, routeIndex, 7).map(
      (hint) => `${params.pathGoal} ${hint} ${location}`
    );
  } else if (mode === "gateway") {
    queries = pickRotatedHints(GATEWAY_QUERY_HINTS, routeIndex, 7).map(
      (hint) => `${params.pathGoal} ${hint} ${location}`
    );
  } else {
    const hints = ROUTE_QUERY_HINTS[params.routeId] ?? ROUTE_QUERY_HINTS["real-openings"];
    const accessHintA = OPPORTUNITY_ACCESS_HINTS[routeIndex % OPPORTUNITY_ACCESS_HINTS.length];
    const accessHintB =
      OPPORTUNITY_ACCESS_HINTS[(routeIndex + 3) % OPPORTUNITY_ACCESS_HINTS.length];

    queries = [
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
  }

  if (mode === "route") {
    queries.push(...goalSpecificQueries(params.pathGoal, location));
    const experienceLevel = mapStartingFromToExperienceLevel(params.startingFrom ?? "");
    queries.push(...beginnerQueries(params.pathGoal, location, experienceLevel));
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
  // v0.12: resale_arbitrage and small_business_opening are split out from
  // the broader income_generating/ownership_path patterns so a flea-market
  // resale lead and a small-business-grant lead don't both get flattened
  // into the same generic label.
  {
    category: "resale_arbitrage",
    pattern: /\b(resell(?:ing|er)?|flea market|estate sale|liquidation|thrift (?:store |shop )?arbitrage|arbitrage|consignment|repair (?:OR|or) refurbish(?:ing)?|refurbish(?:ed|ing)?)\b/,
  },
  {
    category: "small_business_opening",
    pattern: /\b(small business grant|business plan competition|storefront|launch your business|local business gap|unmet need|vendor market)\b/,
  },
  {
    category: "income_generating",
    pattern: /\b(side hustle|sell your|freelance|gig work|passive income)\b/,
  },
  {
    category: "ownership_path",
    pattern: /\b(start(?:ing)? your (?:own )?business|entrepreneur(?:ship)?|own your|franchise)\b/,
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

// "What leverage it may create" — one deterministic sentence per category,
// not per-candidate NLP. Distinct from whyThisMayFit (which explains why
// the search matched); this explains what taking the opportunity could
// concretely open up.
const LEVERAGE_HINTS: Record<OpportunityCategory, string> = {
  consumer_activity: "Mostly a paid experience — limited leverage beyond the activity itself.",
  skill_building: "Builds a skill that compounds if practiced beyond this one session.",
  income_generating: "Could create direct income potential.",
  access_point: "Creates access to a space, tool, or community you couldn't easily reach otherwise.",
  ownership_path: "Could lead toward owning or running something of your own.",
  proximity_builder: "Puts you near people who could open further doors.",
  credential_step: "Adds a credential or certification that unlocks further steps.",
  community_entry: "A first, low-stakes way into an ongoing group or organization.",
  compounding_opportunity: "Structured to lead somewhere further, not a one-off.",
  gateway_community: "Opens a wider network — trade, cultural, or business connections beyond this one opportunity.",
  bridge_person: "A specific person who could vouch for or introduce you further in.",
  place_based_network: "Anchored to a real place you can keep returning to and building relationships in.",
  diaspora_route: "Runs through a diaspora community's own institutions and trade relationships.",
  trade_access_point: "A concrete entry point into a trade, sourcing, or import/export network.",
  relationship_path: "Builds a specific relationship that could compound over time.",
  resale_arbitrage: "Direct resale or arbitrage margin potential.",
  small_business_opening: "A concrete opening for starting or growing a small business.",
};

/** "What next step it suggests" — one deterministic, category-driven suggestion, no AI call. */
const NEXT_STEP_HINTS: Record<OpportunityCategory, string> = {
  consumer_activity: "Attend if it genuinely interests you, but don't expect it to open doors on its own.",
  skill_building: "Sign up, then look for a way to keep practicing after it ends.",
  income_generating: "Do the math on real margins before committing time or money.",
  access_point: "Show up during open hours and ask how to get more involved.",
  ownership_path: "Reach out and ask what it actually takes to get started.",
  proximity_builder: "Volunteer or attend once, then follow up with one person you meet.",
  credential_step: "Confirm exactly what the credential unlocks before enrolling.",
  community_entry: "Attend one meeting or event before deciding if it's a fit.",
  compounding_opportunity: "Commit to the first cycle and evaluate before the next one.",
  gateway_community: "Visit in person and ask who else you should talk to.",
  bridge_person: "Reach out directly and be specific about what you're hoping to learn.",
  place_based_network: "Go back more than once — relationships here build over repeat visits.",
  diaspora_route: "Approach with genuine interest in learning, not just extracting a deal.",
  trade_access_point: "Ask how sourcing/import relationships actually get built here.",
  relationship_path: "Invest time before expecting anything back.",
  resale_arbitrage: "Test with a small batch before scaling up.",
  small_business_opening: "Ask about eligibility and next application steps.",
};

function looksCanonical(hostname: string, sourceType: OpportunitySourceType, url: string): boolean {
  if (sourceType !== "direct_submission") return true;
  try {
    const path = new URL(url).pathname;
    return path.length > 1; // a real page, not just a bare homepage
  } catch {
    return false;
  }
}

const FIT_REASON_FALLBACK: Record<PathoroFit, string> = {
  strong_opportunity: "A specific, actionable page with a clear next step.",
  maybe_useful: "Could be useful, but not yet clearly confirmed as one specific opportunity.",
  consumer_activity: "A real, bookable activity — more consumer experience than access-building opportunity.",
  weak_informational: "This looks more like an informational page than a direct opportunity.",
};

/**
 * Combines page quality (is this even a specific, actionable page) with
 * opportunity substance (is it consumption or access) into one label the
 * admin can scan at a glance. See PathoroFit's doc comment for why these
 * are kept as two separate inputs rather than one score.
 */
function computePathoroFit(params: {
  weak: boolean;
  opportunityCategory: OpportunityCategory;
  confidence: ScoutConfidence;
  hasNextAction: boolean;
}): PathoroFit {
  if (params.weak) return "weak_informational";
  if (params.opportunityCategory === "consumer_activity") return "consumer_activity";
  if (params.confidence === "high" && params.hasNextAction) return "strong_opportunity";
  return "maybe_useful";
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
  const snippet = cleanSnippet(result.content ?? "");
  const likelyRouteId = suggestRouteIdFromText(`${title} ${snippet}`);
  const sourceType = classifySourceType(hostname);
  const canonicalSourceLikely = looksCanonical(hostname, sourceType, result.url);
  const routeMatches = likelyRouteId === requestedRouteId;

  const combinedText = `${title} ${snippet}`;
  const hasNextAction = NEXT_ACTION_PATTERN.test(combinedText);
  const hasDateOrTime = DATE_OR_TIME_PATTERN.test(combinedText);

  let confidence: ScoutConfidence = "low";
  if (canonicalSourceLikely && routeMatches) confidence = "high";
  else if (canonicalSourceLikely || routeMatches) confidence = "medium";
  if ((result.score ?? 0) > 0.7 && confidence === "low") confidence = "medium";
  if (hasDateOrTime && confidence === "low") confidence = "medium";
  if (hasNextAction && confidence === "medium") confidence = "high";

  const weakCheck = isWeakResultPage({ hostname, url: result.url, title, snippet, hasNextAction, hasDateOrTime });
  if (weakCheck.weak) confidence = "low";

  const opportunityCategory = classifyOpportunityCategory(title, snippet);
  const pathoroFit = computePathoroFit({ weak: weakCheck.weak, opportunityCategory, confidence, hasNextAction });
  const fitReason = weakCheck.reason ?? FIT_REASON_FALLBACK[pathoroFit];

  return {
    title,
    url: result.url,
    sourceName: prettifyHostname(hostname),
    snippet,
    likelyRouteId,
    whyThisMayFit: `Matched "${query}" and reads as ${
      canonicalSourceLikely ? "a real, specific page" : "a possible lead"
    } rather than a generic listing.`,
    leverageHint: LEVERAGE_HINTS[opportunityCategory],
    suggestedNextStep: NEXT_STEP_HINTS[opportunityCategory],
    opportunityType: ROUTE_OPPORTUNITY_TYPE_LABELS[likelyRouteId] ?? "Class / Opening",
    confidence,
    sourceType,
    canonicalSourceLikely,
    opportunityCategory,
    pathoroFit,
    fitReason,
  };
}

export async function scoutOpportunities(params: {
  city: string;
  state?: string;
  pathGoal: string;
  routeId: string;
  keywords?: string;
  scoutMode?: ScoutMode;
  startingFrom?: string;
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

  // Ranking priority (see "Rank opportunities by starting point fit"
  // PART 4/6):
  //   1. Goal fit (direct vs. adjacent/weak — lib/goalFitLabel.ts) — a
  //      direct-but-lower-confidence candidate still beats a highly
  //      specific page for the wrong thing (e.g. a nursing volunteer
  //      listing for a "licensed therapist" goal).
  //   2. Starting-point fit (lib/startingPointFit.ts) — among
  //      equally-goal-relevant candidates, one reachable from where the
  //      user actually is beats one that requires years of experience
  //      they don't have yet (the volunteer-electrician-needs-3-years
  //      case this feature exists to fix).
  //   3. PathoroFit page quality, then raw confidence, as before.
  const experienceLevel = mapStartingFromToExperienceLevel(params.startingFrom ?? "");
  const rankOf = (candidate: ScoutCandidate) => {
    const goalFit = computeGoalFit(candidate, params.pathGoal);
    const prerequisiteSignal = computePrerequisiteSignal(`${candidate.title} ${candidate.snippet}`);
    const startingPointFit = computeStartingPointFit(prerequisiteSignal, experienceLevel, goalFit);
    return { goalFit, startingPointFit };
  };

  candidates.sort((a, b) => {
    const rankA = rankOf(a);
    const rankB = rankOf(b);
    const goalFitDiff = GOAL_FIT_RANK[rankB.goalFit] - GOAL_FIT_RANK[rankA.goalFit];
    if (goalFitDiff !== 0) return goalFitDiff;
    const startingFitDiff =
      STARTING_POINT_FIT_RANK[rankB.startingPointFit] - STARTING_POINT_FIT_RANK[rankA.startingPointFit];
    if (startingFitDiff !== 0) return startingFitDiff;
    const fitDiff = PATHORO_FIT_RANK[b.pathoroFit] - PATHORO_FIT_RANK[a.pathoroFit];
    if (fitDiff !== 0) return fitDiff;
    const confidenceRank: Record<ScoutConfidence, number> = { high: 2, medium: 1, low: 0 };
    return confidenceRank[b.confidence] - confidenceRank[a.confidence];
  });

  return { candidates: candidates.slice(0, MAX_CANDIDATES), queriesUsed: queries };
}
