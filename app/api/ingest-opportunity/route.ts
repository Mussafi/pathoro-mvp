import {
  ROUTE_OPPORTUNITY_TYPE_LABELS,
  suggestRouteIdFromText,
  type IngestionDraft,
  type IngestionRequestBody,
  type IngestionResponse,
  type OpportunitySourceType,
  type TrustLevel,
} from "@/lib/opportunitySchema";

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_LENGTH = 2_000_000;
const USER_AGENT =
  "PathoroIngestionPrototype/0.1 (+internal admin tool; not for production crawling)";

const BLOCKED_SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "fb.watch",
];

function isBlockedSocialHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return BLOCKED_SOCIAL_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/** Minimal robots.txt check: looks for a blanket "Disallow" for the wildcard user-agent. */
function isPathDisallowed(robotsTxt: string, pathname: string): boolean {
  const lines = robotsTxt.split(/\r?\n/);
  let inWildcardGroup = false;
  let matchedWildcardGroup = false;
  const disallows: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "user-agent") {
      inWildcardGroup = value === "*";
      if (inWildcardGroup) matchedWildcardGroup = true;
    } else if (key === "disallow" && inWildcardGroup) {
      disallows.push(value);
    }
  }

  if (!matchedWildcardGroup) return false;
  return disallows.some((rule) => rule === "/" || (rule.length > 0 && pathname.startsWith(rule)));
}

async function isAllowedByRobots(target: URL): Promise<boolean> {
  try {
    const robotsUrl = new URL("/robots.txt", target.origin);
    const res = await fetchWithTimeout(robotsUrl.toString(), 4000);
    if (!res.ok) return true; // fail open if robots.txt isn't reachable
    const text = await res.text();
    return !isPathDisallowed(text, target.pathname);
  } catch {
    return true; // fail open on network errors
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function getMetaTagContent(
  html: string,
  attrName: "property" | "name",
  attrValue: string
): string | null {
  const pattern = new RegExp(
    `<meta[^>]*(?:${attrName}=["']${attrValue}["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*${attrName}=["']${attrValue}["'])[^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) return null;
  const value = (match[1] ?? match[2] ?? "").trim();
  return value ? decodeHtmlEntities(value) : null;
}

function getTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match) return null;
  const value = match[1].trim();
  return value ? decodeHtmlEntities(value) : null;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDateLabel(html: string): string | null {
  const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
  if (timeMatch) {
    const parsed = new Date(timeMatch[1]);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }
  const text = stripTags(html);
  const dateRegex =
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?\b/;
  const match = text.match(dateRegex);
  return match ? match[0] : null;
}

function extractLocationLabel(html: string): string | null {
  const text = stripTags(html);
  const cityStateRegex = /\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*,\s?[A-Z]{2}\b/;
  const match = text.match(cityStateRegex);
  return match ? match[0] : null;
}

function prettifyHostname(hostname: string): string {
  const stripped = hostname.replace(/^www\./, "");
  const first = stripped.split(".")[0] || stripped;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function humanizeUrlPath(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return prettifyHostname(url.hostname);
  let decoded = last;
  try {
    decoded = decodeURIComponent(last);
  } catch {
    // leave as-is if it isn't valid percent-encoding
  }
  decoded = decoded.replace(/[-_]+/g, " ").trim();
  if (!decoded) return prettifyHostname(url.hostname);
  return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildDraft(params: {
  title: string;
  description: string;
  dateLabel: string;
  hostName: string;
  locationLabel: string;
  sourceUrl: string;
  sourceType: OpportunitySourceType;
  city: string;
  trustLevel: TrustLevel;
}): IngestionDraft {
  const suggestedRouteId = suggestRouteIdFromText(`${params.title} ${params.description}`);
  return {
    title: params.title,
    description: params.description,
    dateLabel: params.dateLabel,
    costLabel: "",
    hostName: params.hostName,
    opportunityType: ROUTE_OPPORTUNITY_TYPE_LABELS[suggestedRouteId] ?? "Class / Event",
    whoItIsFor: "",
    pathItSupports: "",
    whatItMayOpenNext: "",
    effortLevel: "Medium",
    frictionLevel: "Medium",
    trustLevel: params.trustLevel,
    suggestedRouteId,
    sourceUrl: params.sourceUrl,
    sourceType: params.sourceType,
    city: params.city,
    locationLabel: params.locationLabel,
  };
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." } satisfies IngestionResponse, {
      status: 400,
    });
  }

  const { sourceUrl, sourceType, city } = (body ?? {}) as Partial<IngestionRequestBody>;

  if (!sourceUrl || typeof sourceUrl !== "string" || !sourceUrl.trim()) {
    return Response.json(
      { ok: false, error: "Please paste a URL to extract from." } satisfies IngestionResponse,
      { status: 400 }
    );
  }

  let url: URL;
  try {
    url = new URL(sourceUrl.trim());
  } catch {
    return Response.json(
      { ok: false, error: "That doesn't look like a valid URL." } satisfies IngestionResponse,
      { status: 400 }
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return Response.json(
      { ok: false, error: "Only http and https URLs are supported." } satisfies IngestionResponse,
      { status: 400 }
    );
  }

  if (isBlockedSocialHost(url.hostname)) {
    return Response.json(
      {
        ok: false,
        error:
          "Use Instagram/Facebook as a discovery signal. Please provide the organizer website, Eventbrite, Luma, booking page, newsletter, or canonical event page.",
      } satisfies IngestionResponse,
      { status: 400 }
    );
  }

  const resolvedSourceType: OpportunitySourceType =
    (sourceType as OpportunitySourceType) ?? "direct_submission";
  const resolvedCity = typeof city === "string" ? city.trim() : "";

  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    return Response.json(
      {
        ok: false,
        error:
          "This site's robots.txt disallows automated access to this page. Try a different canonical source, or add this opportunity manually.",
      } satisfies IngestionResponse,
      { status: 400 }
    );
  }

  let html: string | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetchWithTimeout(url.toString(), FETCH_TIMEOUT_MS);
    if (!res.ok) {
      fetchError = `The page responded with status ${res.status}. It may require a login or no longer exist.`;
    } else {
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        fetchError = "That URL didn't return a web page Pathoro can read.";
      } else {
        const rawText = await res.text();
        html = rawText.slice(0, MAX_HTML_LENGTH);
      }
    }
  } catch {
    fetchError =
      "Could not reach that URL. It may be down, blocking automated requests, or behind a login.";
  }

  if (fetchError || !html) {
    const draft = buildDraft({
      title: humanizeUrlPath(url),
      description: "",
      dateLabel: "",
      hostName: prettifyHostname(url.hostname),
      locationLabel: "",
      sourceUrl: url.toString(),
      sourceType: resolvedSourceType,
      city: resolvedCity,
      trustLevel: "Low",
    });
    return Response.json(
      {
        ok: true,
        draft,
        warnings: [fetchError ?? "Could not read the page.", "Used the URL to build a fallback draft — please fill in the rest by hand."],
      } satisfies IngestionResponse
    );
  }

  const ogTitle = getMetaTagContent(html, "property", "og:title");
  const titleTag = getTitleTag(html);
  const metaDescription = getMetaTagContent(html, "name", "description");
  const ogDescription = getMetaTagContent(html, "property", "og:description");
  const ogSiteName = getMetaTagContent(html, "property", "og:site_name");
  const dateLabel = extractDateLabel(html);
  const locationLabel = extractLocationLabel(html);

  const warnings: string[] = [];

  const title = ogTitle || titleTag || humanizeUrlPath(url);
  if (!ogTitle && !titleTag) warnings.push("No page title found — used the URL instead.");

  const description = ogDescription || metaDescription || "";
  if (!description) warnings.push("No description found on the page.");

  const hostName = ogSiteName || prettifyHostname(url.hostname);

  if (!dateLabel) warnings.push("No date could be detected — please add one.");
  if (!locationLabel) warnings.push("No location could be detected — please add one.");

  const trustLevel: TrustLevel = ogTitle && (ogDescription || metaDescription) ? "Medium" : "Low";

  const draft = buildDraft({
    title,
    description,
    dateLabel: dateLabel ?? "",
    hostName,
    locationLabel: locationLabel ?? "",
    sourceUrl: url.toString(),
    sourceType: resolvedSourceType,
    city: resolvedCity,
    trustLevel,
  });

  return Response.json({ ok: true, draft, warnings } satisfies IngestionResponse);
}
