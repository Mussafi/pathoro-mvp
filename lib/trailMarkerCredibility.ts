import type { CredibilityType } from "@/lib/trailMarkerSchema";

/**
 * Server-side credibility enforcement (v0.40 PART 10) — a public
 * submitter can never award themselves "verified experience" or "licensed
 * guide" status, no matter what they type into experience/role fields.
 * Only an admin, via PATCH /api/trail-markers/[id], can upgrade a marker
 * to either of those. Writing "licensed therapist" into experienceLabel
 * is kept as submitted context (shown as-is), but the credibility badge
 * stays "Credential not verified" until an admin says otherwise.
 */
export function computeInitialCredibilityType(input: {
  authorRole?: string;
  experienceLabel?: string;
}): CredibilityType {
  const claimsExperience = Boolean(input.authorRole?.trim() || input.experienceLabel?.trim());
  return claimsExperience ? "credential_not_verified" : "peer";
}
