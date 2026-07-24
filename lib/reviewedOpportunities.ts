import { routeOpportunities } from "@/lib/opportunities";
import type { IngestionDraft, Opportunity, OpportunityStatus } from "@/lib/opportunitySchema";

const STORAGE_KEY = "pathoro.reviewedOpportunities.v1";

export function loadReviewedOpportunities(): Opportunity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Opportunity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(list: Opportunity[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Upserts an opportunity by id into the reviewed store and persists it. */
export function saveReviewedOpportunity(opportunity: Opportunity): Opportunity[] {
  const current = loadReviewedOpportunities();
  const next = [...current.filter((o) => o.id !== opportunity.id), opportunity];
  persist(next);
  return next;
}

export function clearReviewedOpportunities(): Opportunity[] {
  persist([]);
  return [];
}

/** Merges reviewed opportunities with seed data, reviewed ones taking priority on id clashes. */
export function mergeWithSeed(reviewed: Opportunity[]): Opportunity[] {
  const reviewedIds = new Set(reviewed.map((o) => o.id));
  const seedWithoutOverridden = routeOpportunities.filter((o) => !reviewedIds.has(o.id));
  return [...reviewed, ...seedWithoutOverridden];
}

/** Filters a merged opportunity list for a route, sorting live and city-matched opportunities first. */
export function filterForRoute(all: Opportunity[], routeId: string, cityHint?: string): Opportunity[] {
  const forRoute = all.filter((o) => o.routeId === routeId);
  const city = cityHint?.toLowerCase().trim();
  return [...forRoute].sort((a, b) => {
    const aLive = a.status === "live" ? 1 : 0;
    const bLive = b.status === "live" ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    if (city) {
      const aCity = a.city.toLowerCase() === city ? 1 : 0;
      const bCity = b.city.toLowerCase() === city ? 1 : 0;
      if (aCity !== bCity) return bCity - aCity;
    }
    return 0;
  });
}

export function createOpportunityId(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "opportunity"}-${Date.now().toString(36)}`;
}

/** Builds a full Opportunity from a reviewed/edited ingestion draft. */
export function buildOpportunityFromDraft(
  draft: IngestionDraft,
  routeId: string,
  status: OpportunityStatus,
  id?: string
): Opportunity {
  return {
    id: id ?? createOpportunityId(draft.title),
    title: draft.title,
    sourceUrl: draft.sourceUrl,
    sourceName: draft.hostName || "Unknown source",
    sourceType: draft.sourceType,
    city: draft.city,
    state: "",
    locationLabel: draft.locationLabel,
    dateLabel: draft.dateLabel,
    costLabel: draft.costLabel,
    hostName: draft.hostName,
    description: draft.description,
    routeId,
    opportunityType: draft.opportunityType,
    whoItIsFor: draft.whoItIsFor,
    pathItSupports: draft.pathItSupports,
    whatItMayOpenNext: draft.whatItMayOpenNext,
    effortLevel: draft.effortLevel,
    frictionLevel: draft.frictionLevel,
    trustLevel: draft.trustLevel,
    status,
  };
}
