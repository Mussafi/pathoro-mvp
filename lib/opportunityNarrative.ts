/**
 * Pure copy-generation helpers shared by the admin review UI, route-planning
 * cards, and the opportunity detail page. Every string here is computed from
 * fields that already exist on Opportunity/IngestionDraft — no new schema.
 *
 * The point: Pathoro isn't saving events, it's saving real-world access
 * points along a path. These functions turn the same underlying fields into
 * that framing everywhere an opportunity is shown.
 */

export type NarrativeInput = {
  title: string;
  description: string;
  whoItIsFor: string;
  pathItSupports: string;
  whatItMayOpenNext: string;
  opportunityType: string;
  hostName: string;
  locationLabel: string;
  dateLabel: string;
  costLabel: string;
  sourceUrl: string | null;
};

/** Why this opportunity surfaced for this person, on this route. */
export function getWhyThisAppeared(input: NarrativeInput): string {
  const { pathItSupports, whoItIsFor } = input;
  if (pathItSupports && whoItIsFor) {
    return `It supports ${pathItSupports.toLowerCase()} — and it's built for ${whoItIsFor.toLowerCase()}.`;
  }
  if (pathItSupports) {
    return `It supports ${pathItSupports.toLowerCase()}.`;
  }
  if (whoItIsFor) {
    return `It's for ${whoItIsFor.toLowerCase()}.`;
  }
  return "It's a path-supporting opportunity for your selected route.";
}

/** What real-world access this opportunity concretely creates. */
export function getWhatAccessThisCreates(input: NarrativeInput): string {
  const { opportunityType, hostName, locationLabel, description } = input;
  const parts: string[] = [];
  if (opportunityType) parts.push(opportunityType);
  if (hostName) parts.push(`with ${hostName}`);
  if (locationLabel) parts.push(`in ${locationLabel}`);
  if (parts.length > 0) {
    return `A real-world access point: ${parts.join(" ")}.`;
  }
  return description || "A real-world access point along this route.";
}

/** The concrete next action someone would take to use this opportunity. */
export function getNextActionSummary(input: NarrativeInput): string {
  const { dateLabel, costLabel, sourceUrl } = input;
  const bits = [dateLabel, costLabel].filter(Boolean);
  if (bits.length > 0) {
    return `Show up: ${bits.join(" · ")}.`;
  }
  if (sourceUrl) {
    return "Open the original source to take the next step.";
  }
  return "Reach out to take the next step.";
}
