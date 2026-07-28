import { Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BranchFactors } from "@/lib/trailMapScoring";
import type {
  PathGuideRecommendation,
  TrailMapBranch,
  TrailMapGoal,
  TrailMapNode,
  TrailMilestone,
} from "@/lib/trailMapData";
import { ICON_BY_NAME } from "@/lib/generatedTrailMaps";

/**
 * Defensive sanitization layer. A generated draft (or, in principle,
 * any TrailMapGoal — including a curated one that somehow arrived
 * malformed) must never crash the page. Every render path
 * (app/trail-map/page.tsx) should pass its goal through
 * normalizeTrailMapGoal before rendering, and this is the one place
 * that decides what "good enough to render" means.
 *
 * The bug this exists to prevent: a LucideIcon is a React component,
 * not data. Sending a TrailMapGoal through `Response.json()` (the
 * generate API route) silently mangles every `branch.icon` into an
 * inert object — `<Icon />` then throws "type is invalid" and takes
 * the whole page down. normalizeIcon() below is the fix for that
 * specific crash; everything else here is the same defensive posture
 * applied to every other field the UI assumes exists.
 */

const DEFAULT_ICON: LucideIcon = Compass;

const DEFAULT_BRANCH_FACTORS: BranchFactors = {
  routineCognitiveWork: 2,
  automationToolFit: 2,
  remoteDigitalWork: 1,
  humanTrustNeed: 2,
  regulationBarrier: 2,
  physicalPresenceNeed: 2,
  emotionalJudgmentNeed: 2,
  marketDemand: 3,
  incomeUpside: 2,
  autonomyPotential: 2,
  upfrontCost: 2,
  timeToCredential: 2,
  emotionalLoad: 2,
  relationshipLeverage: 2,
  opportunityLeverage: 2,
};

const DEFAULT_NODES: [TrailMapNode, TrailMapNode, TrailMapNode] = [
  { id: "n1", label: "Get started" },
  { id: "n2", label: "Build experience" },
  { id: "n3", label: "Reach the next step" },
];

const DEFAULT_PATH_GUIDE: PathGuideRecommendation = {
  cta: "Talk to someone on this path",
  subtitle: "Ask what this role actually requires day to day.",
  badge: "Peer trail marker",
};

const DEFAULT_MILESTONES: TrailMilestone[] = [
  { id: "clarify", label: "Clarify the path", status: "current" },
];

const DEFAULT_DISCLAIMER =
  "Requirements and access points vary by location, market, institution, and role. Treat this as a starting map, not official guidance.";

/** Recovers the real icon component for whatever arrives in this
 * field. The primary case: the generate API route sends an explicit
 * icon *name* string (serializeTrailMapGoalForWire) since a
 * LucideIcon component can't survive JSON — that string is looked up
 * here. Two more cases are handled defensively even though neither
 * should occur in practice: an already-valid component (curated
 * goals, which never cross an API boundary, pass straight through),
 * and a raw un-serialized icon object missing its (non-enumerable,
 * JSON-unsafe) displayName — this last case is exactly what silently
 * broke in production before the explicit-string fix, kept here only
 * as a last-resort safety net. Anything unrecognized falls back to a
 * safe default rather than crashing the render. */
function normalizeIcon(icon: unknown): LucideIcon {
  if (typeof icon === "function") return icon as LucideIcon;
  if (typeof icon === "string" && ICON_BY_NAME[icon]) return ICON_BY_NAME[icon];
  if (icon && typeof icon === "object") {
    const name = (icon as { displayName?: string }).displayName;
    if (name && ICON_BY_NAME[name]) return ICON_BY_NAME[name];
  }
  return DEFAULT_ICON;
}

function normalizeNodes(nodes: unknown): [TrailMapNode, TrailMapNode, TrailMapNode] {
  if (
    Array.isArray(nodes) &&
    nodes.length === 3 &&
    nodes.every((n) => n && typeof n.id === "string" && typeof n.label === "string")
  ) {
    return nodes as [TrailMapNode, TrailMapNode, TrailMapNode];
  }
  return DEFAULT_NODES;
}

function normalizeBranch(branch: Partial<TrailMapBranch> | undefined | null, fallbackId: string): TrailMapBranch {
  const b = branch ?? {};
  const title = typeof b.title === "string" && b.title.trim() ? b.title : "Explore this path";
  return {
    id: typeof b.id === "string" && b.id.trim() ? b.id : fallbackId,
    title,
    icon: normalizeIcon(b.icon),
    fit: b.fit ?? "Worth exploring",
    pitch: typeof b.pitch === "string" && b.pitch.trim() ? b.pitch : `A possible branch on this path: ${title}.`,
    whyItFits: typeof b.whyItFits === "string" && b.whyItFits.trim() ? b.whyItFits : "Worth exploring as part of this path.",
    nodes: normalizeNodes(b.nodes),
    factors:
      b.factors && typeof b.factors.typicalTime === "string" && typeof b.factors.education === "string"
        ? b.factors
        : { typicalTime: "Varies", education: "Requirements vary — verify before relying on this" },
    branchFactors: b.branchFactors ?? DEFAULT_BRANCH_FACTORS,
    tradeoffs: Array.isArray(b.tradeoffs) && b.tradeoffs.length > 0 ? b.tradeoffs : ["Requirements vary — verify before relying on this."],
    nextStep:
      b.nextStep && typeof b.nextStep.title === "string" && typeof b.nextStep.description === "string"
        ? b.nextStep
        : { title: "Talk to someone on this path", description: "Ask what this role actually requires day to day." },
  };
}

/** Guarantees: branches is a non-empty array; every branch has a full
 * set of fields the UI assumes exist; defaultBranchId always points
 * at a real branch; milestones/notes are always arrays; pathGuide
 * always has a fallback. Safe to call on both curated and generated
 * goals — a well-formed goal passes through essentially unchanged. */
export function normalizeTrailMapGoal(goal: TrailMapGoal): TrailMapGoal {
  const goalId = typeof goal?.id === "string" && goal.id.trim() ? goal.id : "path";

  const rawBranches = Array.isArray(goal?.branches) ? goal.branches : [];
  const branches = (rawBranches.length > 0 ? rawBranches : [undefined]).map((b, i) =>
    normalizeBranch(b, `${goalId}-branch-${i}`)
  );

  const defaultBranchId = branches.some((b) => b.id === goal?.defaultBranchId) ? goal.defaultBranchId : branches[0].id;

  const milestones = Array.isArray(goal?.milestones) && goal.milestones.length > 0 ? goal.milestones : DEFAULT_MILESTONES;
  const notes = Array.isArray(goal?.notes) ? goal.notes : [];

  return {
    ...goal,
    id: goalId,
    label: typeof goal?.label === "string" && goal.label.trim() ? goal.label : goal?.pathTitle || "This path",
    pathTitle: typeof goal?.pathTitle === "string" && goal.pathTitle.trim() ? goal.pathTitle : "This Path",
    subtitle:
      typeof goal?.subtitle === "string" && goal.subtitle.trim()
        ? goal.subtitle
        : "Explore this path, compare branches, and choose what fits.",
    milestones,
    markersReached: typeof goal?.markersReached === "number" ? goal.markersReached : 0,
    markersTotal: typeof goal?.markersTotal === "number" ? goal.markersTotal : milestones.length,
    defaultBranchId,
    branches,
    notes,
    notesTotal: typeof goal?.notesTotal === "number" ? goal.notesTotal : notes.length,
    pathGuide: goal?.pathGuide ?? DEFAULT_PATH_GUIDE,
    disclaimer: typeof goal?.disclaimer === "string" && goal.disclaimer.trim() ? goal.disclaimer : DEFAULT_DISCLAIMER,
  };
}
