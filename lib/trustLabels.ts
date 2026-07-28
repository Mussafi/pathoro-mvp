import type { Opportunity } from "@/lib/opportunitySchema";

/**
 * The opportunities table only stores a coarse trustLevel (Low/Medium/
 * High) plus sourceType/status — there's no dedicated trust-label or
 * hidden-requirements column (see docs/V0.32 schema notes). Rather than
 * add a migration for display-only text, these labels are derived from
 * fields that already exist, the same way Trail Map's Pathoro-estimate
 * scores are computed rather than hand-typed per record.
 */
export type TrustLabel =
  | "Verified live"
  | "Recently checked"
  | "Source-backed"
  | "Community-confirmed"
  | "Stale risk"
  | "Possible ghost listing"
  | "Source unclear"
  | "Unreviewed scout candidate"
  | "Example listing";

export const TRUST_LABEL_CLASS: Record<TrustLabel, string> = {
  "Verified live": "border-green/40 bg-green/10 text-green",
  "Recently checked": "border-green/40 bg-green/10 text-green",
  "Source-backed": "border-line/70 bg-cream-field text-ink-soft",
  "Community-confirmed": "border-line/70 bg-cream-field text-ink-soft",
  "Stale risk": "border-amber-400/40 bg-amber-400/10 text-amber-700",
  "Possible ghost listing": "border-red-400/40 bg-red-400/10 text-red-700",
  "Source unclear": "border-amber-400/40 bg-amber-400/10 text-amber-700",
  "Unreviewed scout candidate": "border-amber-400/40 bg-amber-400/10 text-amber-700",
  "Example listing": "border-line/70 bg-cream-field text-ink-faint",
};

const COMMUNITY_SOURCE_TYPES = new Set(["reddit_signal", "volunteer_board", "newsletter"]);

/** Never claims more confidence than the underlying fields support — a
 * seed/mock row always reads "Example listing" regardless of its
 * trustLevel, and a candidate never reads as more than "Unreviewed". */
export function computeTrustLabel(
  opportunity: Pick<Opportunity, "sourceType" | "sourceUrl" | "status" | "trustLevel">
): TrustLabel {
  if (opportunity.sourceType === "mock_seed") return "Example listing";
  if (opportunity.status === "expired") return "Stale risk";
  if (opportunity.status !== "live") return "Source unclear";
  if (!opportunity.sourceUrl) return "Source unclear";
  if (COMMUNITY_SOURCE_TYPES.has(opportunity.sourceType)) return "Community-confirmed";
  if (opportunity.trustLevel === "High") return "Verified live";
  if (opportunity.trustLevel === "Medium") return "Source-backed";
  return "Possible ghost listing";
}

/** A scout candidate is always this label, independent of its confidence
 * field — "unreviewed" is a review-state fact, not a quality estimate. */
export const CANDIDATE_TRUST_LABEL: TrustLabel = "Unreviewed scout candidate";

/**
 * Honest best-effort answer to "what hidden requirements matter?" from
 * frictionLevel/effortLevel/costLabel — the closest existing fields to a
 * real hidden-requirements note. Always framed as a Pathoro estimate, not
 * an extracted fact, since none of this is actually verified per-listing.
 */
export function getHiddenRequirementsNote(input: {
  frictionLevel: string;
  effortLevel: string;
  costLabel: string;
}): string {
  const parts: string[] = [];
  if (input.frictionLevel === "High") {
    parts.push("real friction to get started — paperwork, prerequisites, or a waitlist");
  } else if (input.frictionLevel === "Medium") {
    parts.push("some friction to get started");
  }
  if (input.effortLevel === "High") {
    parts.push("a real time commitment once you're in");
  }
  if (input.costLabel) {
    parts.push(`a cost of ${input.costLabel}`);
  }
  if (parts.length === 0) {
    return "No major hidden requirements are flagged here — but always verify specifics before relying on this.";
  }
  return `Pathoro estimate: expect ${parts.join(" and ")}. Verify specifics before committing.`;
}
