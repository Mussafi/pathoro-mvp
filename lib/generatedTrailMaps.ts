import {
  Briefcase,
  Compass,
  GraduationCap,
  HardHat,
  Rocket,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { BranchFactors } from "@/lib/trailMapScoring";
import type { GuideBadge, TrailMapBranch, TrailMapGoal, TrailMilestone, TrailNote } from "@/lib/trailMapData";

/**
 * Deterministic heuristic generator for Trail Map drafts — the fallback
 * for any goal that doesn't match a curated template (see
 * lib/goalSpecificity.ts's mapGoalToTrailMapGoal, which always wins
 * when it matches). No LLM is wired up yet; this produces a
 * same-shaped TrailMapGoal from keyword classification and fixed
 * per-category archetype data.
 *
 * The seam for a future AI provider is this function's signature and
 * return shape: a provider-backed generator would take the same
 * (goalText, context) input and return the same TrailMapGoal, just
 * with real research behind the branches instead of a generic
 * archetype. Every draft is marked confidence: "generated_starter" —
 * see docs/V0.30-DYNAMIC-TRAIL-MAPS.md.
 */

export type GenerateTrailMapContext = {
  city?: string;
  state?: string;
  /** Accepted for a future AI provider (onboarding answers, etc.) —
   * not used by the deterministic heuristic today. */
  userContext?: string;
};

type BranchArchetype =
  | "entry"
  | "certification"
  | "apprenticeship"
  | "specialization"
  | "independent"
  | "employed"
  | "business_owner"
  | "growth"
  | "oversight";

/** The 7 broad path shapes a generated map can fall into — chosen so
 * branches feel specific to the kind of path, not a single generic
 * template stretched over every goal. */
export type PathCategory =
  | "licensed_trade"
  | "licensed_care"
  | "creative_service"
  | "local_business"
  | "digital_knowledge"
  | "education_public"
  | "generic";

const LICENSED_TRADE_PATTERN =
  /\bhvac\b|welder|welding|barber|contractor|mechanic|electrician|plumber|technician|locksmith|machinist|carpenter|mason|roofer/i;
const LICENSED_CARE_PATTERN =
  /physical therapist|therapist assistant|dental hygienist|social worker|dietitian|nutritionist|\bnurse\b|hygienist|paramedic|\bemt\b|occupational therapist|speech[\s-](language|therapist)|physician assistant|midwife/i;
const CREATIVE_SERVICE_PATTERN =
  /photographer|tattoo artist|interior designer|videographer|makeup artist|florist|hair stylist|illustrator|filmmaker|wedding planner|graphic designer/i;
const LOCAL_BUSINESS_PATTERN =
  /restaurant|coffee shop|cleaning business|landscaping|\bcafe\b|bakery|salon owner|gym owner|shop owner|store owner|business owner|franchise/i;
const DIGITAL_KNOWLEDGE_PATTERN =
  /ux designer|ui designer|product manager|data analyst|data scientist|software engineer|ai (safety )?researcher|\bresearcher\b|machine learning|\banalyst\b|developer|programmer|\bux\b|\bui\b/i;
const EDUCATION_PUBLIC_PATTERN =
  /school counselor|librarian|nonprofit director|\bteacher\b|professor|public administrator|policy analyst|case manager/i;

/** Exported so lib/goalSpecificity.ts can decide whether an arbitrary
 * (non-curated) goal is specific enough to recommend the Trail Map —
 * "specific enough to generate a real starter map" is exactly what
 * "generic" vs. everything else already means here. */
export function classifyCategory(goalText: string): PathCategory {
  if (LICENSED_TRADE_PATTERN.test(goalText)) return "licensed_trade";
  if (LICENSED_CARE_PATTERN.test(goalText)) return "licensed_care";
  if (CREATIVE_SERVICE_PATTERN.test(goalText)) return "creative_service";
  if (LOCAL_BUSINESS_PATTERN.test(goalText)) return "local_business";
  if (DIGITAL_KNOWLEDGE_PATTERN.test(goalText)) return "digital_knowledge";
  if (EDUCATION_PUBLIC_PATTERN.test(goalText)) return "education_public";
  return "generic";
}

const LICENSED_CATEGORIES: PathCategory[] = ["licensed_trade", "licensed_care"];

const ACRONYMS: Record<string, string> = { ux: "UX", ui: "UI", hvac: "HVAC", it: "IT", ai: "AI" };
const LOWERCASE_WORDS = new Set(["a", "an", "the", "of", "in", "to", "for", "and", "or"]);

/** "become a licensed hvac technician" -> "Licensed HVAC Technician".
 * Strips leading "become a/an" framing and title-cases the remaining
 * role phrase, preserving known acronyms (ux, hvac, ai). */
function deriveRoleTitle(goalText: string): string {
  const stripped = goalText
    .trim()
    .replace(/^(i want to |i'd like to )?(become|becoming|be)\s+(an?\s+)?/i, "")
    .trim();
  const words = stripped.split(/(\s+|\/)/).filter(Boolean);
  return words
    .map((word, i) => {
      if (/^\s+$/.test(word) || word === "/") return word;
      const lower = word.toLowerCase();
      if (ACRONYMS[lower]) return ACRONYMS[lower];
      if (i > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ARCHETYPE_ICON: Record<BranchArchetype, LucideIcon> = {
  entry: Compass,
  certification: ShieldCheck,
  apprenticeship: HardHat,
  specialization: GraduationCap,
  independent: UserCog,
  employed: Users,
  business_owner: Store,
  growth: Rocket,
  oversight: Briefcase,
};

/** LucideIcon components are React elements, not data — they don't
 * survive a JSON round-trip (POST /api/trail-map/generate serializes
 * the goal, which turns each `icon` into an inert `{}`-ish object).
 * Exported so the client can look the real component back up by name
 * after fetching — see lib/trailMapNormalize.ts's normalizeIcon. */
export const ICON_BY_NAME: Record<string, LucideIcon> = {
  Compass,
  ShieldCheck,
  HardHat,
  GraduationCap,
  UserCog,
  Users,
  Store,
  Rocket,
  Briefcase,
};

/** The reverse of ICON_BY_NAME. A lucide-react component's own
 * `displayName` property is non-enumerable, so it does NOT survive
 * `JSON.stringify` — confirmed to serialize as `{}` with no trace of
 * which icon it was. Relying on it after a JSON round-trip is what
 * caused the production crash: the API route must call this to get an
 * explicit, serializable string *before* responding, rather than
 * sending the component (or hoping something JSON-shaped falls out of
 * it) and trying to recover the name on the other side. */
export function getIconName(icon: LucideIcon): string {
  const match = Object.entries(ICON_BY_NAME).find(([, component]) => component === icon);
  return match ? match[0] : "Compass";
}

/** Call this on a generated goal right before `Response.json(...)` in
 * the API route — never send `branch.icon` as-is over the wire.
 * Everything else on TrailMapGoal is plain data and survives JSON
 * fine; icon is the one field that's actually a React component. */
export function serializeTrailMapGoalForWire(goal: TrailMapGoal): TrailMapGoal {
  return {
    ...goal,
    branches: goal.branches.map((branch) => ({
      ...branch,
      icon: getIconName(branch.icon) as unknown as LucideIcon,
    })),
  };
}

const ARCHETYPE_FACTORS: Record<BranchArchetype, BranchFactors> = {
  entry: {
    routineCognitiveWork: 1, automationToolFit: 1, remoteDigitalWork: 1, humanTrustNeed: 2,
    regulationBarrier: 2, physicalPresenceNeed: 3, emotionalJudgmentNeed: 2, marketDemand: 4,
    incomeUpside: 2, autonomyPotential: 2, upfrontCost: 2, timeToCredential: 2, emotionalLoad: 2,
    relationshipLeverage: 2, opportunityLeverage: 3,
  },
  certification: {
    routineCognitiveWork: 1, automationToolFit: 1, remoteDigitalWork: 0, humanTrustNeed: 3,
    regulationBarrier: 4, physicalPresenceNeed: 3, emotionalJudgmentNeed: 3, marketDemand: 4,
    incomeUpside: 3, autonomyPotential: 2, upfrontCost: 2, timeToCredential: 3, emotionalLoad: 2,
    relationshipLeverage: 2, opportunityLeverage: 3,
  },
  apprenticeship: {
    routineCognitiveWork: 1, automationToolFit: 0, remoteDigitalWork: 0, humanTrustNeed: 3,
    regulationBarrier: 3, physicalPresenceNeed: 4, emotionalJudgmentNeed: 2, marketDemand: 4,
    incomeUpside: 2, autonomyPotential: 2, upfrontCost: 1, timeToCredential: 3, emotionalLoad: 2,
    relationshipLeverage: 3, opportunityLeverage: 3,
  },
  specialization: {
    routineCognitiveWork: 2, automationToolFit: 2, remoteDigitalWork: 1, humanTrustNeed: 3,
    regulationBarrier: 2, physicalPresenceNeed: 3, emotionalJudgmentNeed: 3, marketDemand: 3,
    incomeUpside: 3, autonomyPotential: 3, upfrontCost: 2, timeToCredential: 2, emotionalLoad: 2,
    relationshipLeverage: 3, opportunityLeverage: 3,
  },
  independent: {
    routineCognitiveWork: 1, automationToolFit: 2, remoteDigitalWork: 2, humanTrustNeed: 3,
    regulationBarrier: 1, physicalPresenceNeed: 2, emotionalJudgmentNeed: 2, marketDemand: 3,
    incomeUpside: 3, autonomyPotential: 5, upfrontCost: 2, timeToCredential: 1, emotionalLoad: 2,
    relationshipLeverage: 3, opportunityLeverage: 3,
  },
  employed: {
    routineCognitiveWork: 2, automationToolFit: 2, remoteDigitalWork: 2, humanTrustNeed: 2,
    regulationBarrier: 1, physicalPresenceNeed: 2, emotionalJudgmentNeed: 2, marketDemand: 3,
    incomeUpside: 3, autonomyPotential: 2, upfrontCost: 1, timeToCredential: 1, emotionalLoad: 2,
    relationshipLeverage: 2, opportunityLeverage: 3,
  },
  business_owner: {
    routineCognitiveWork: 2, automationToolFit: 1, remoteDigitalWork: 1, humanTrustNeed: 4,
    regulationBarrier: 3, physicalPresenceNeed: 2, emotionalJudgmentNeed: 3, marketDemand: 3,
    incomeUpside: 5, autonomyPotential: 5, upfrontCost: 4, timeToCredential: 4, emotionalLoad: 3,
    relationshipLeverage: 4, opportunityLeverage: 4,
  },
  growth: {
    routineCognitiveWork: 2, automationToolFit: 2, remoteDigitalWork: 2, humanTrustNeed: 3,
    regulationBarrier: 1, physicalPresenceNeed: 2, emotionalJudgmentNeed: 3, marketDemand: 3,
    incomeUpside: 4, autonomyPotential: 4, upfrontCost: 2, timeToCredential: 2, emotionalLoad: 2,
    relationshipLeverage: 3, opportunityLeverage: 4,
  },
  oversight: {
    routineCognitiveWork: 3, automationToolFit: 2, remoteDigitalWork: 2, humanTrustNeed: 3,
    regulationBarrier: 5, physicalPresenceNeed: 2, emotionalJudgmentNeed: 3, marketDemand: 3,
    incomeUpside: 3, autonomyPotential: 4, upfrontCost: 2, timeToCredential: 3, emotionalLoad: 2,
    relationshipLeverage: 3, opportunityLeverage: 3,
  },
};

/** Category-wide nudges applied on top of the shared per-archetype
 * BranchFactors baseline, so a trade path doesn't score AI replacement
 * risk the same way an in-house digital role does even when they share
 * an archetype (e.g. "employed"). Values are deltas (can be negative),
 * clamped to the valid 0-5 range per factor by applyFactorDelta. Chosen
 * so aiRiskScore (lib/trailMapScoring.ts) lands where each category
 * intuitively should: trades and licensed care mostly Low/Very Low;
 * digital/knowledge work more nuanced (Low through High depending on
 * branch); creative work Low/Medium, not uniformly Very Low. */
const CATEGORY_FACTOR_DELTAS: Record<PathCategory, Partial<BranchFactors>> = {
  licensed_trade: { physicalPresenceNeed: 1, automationToolFit: -2, humanTrustNeed: 1 },
  licensed_care: { humanTrustNeed: 1, regulationBarrier: 1, physicalPresenceNeed: 1, automationToolFit: -1, upfrontCost: 1 },
  creative_service: { humanTrustNeed: 1, relationshipLeverage: 1 },
  local_business: { humanTrustNeed: 1, autonomyPotential: 1, upfrontCost: 1 },
  digital_knowledge: { automationToolFit: 1, remoteDigitalWork: 1 },
  education_public: { humanTrustNeed: 1, regulationBarrier: 1 },
  generic: {},
};

function clampFactor(n: number): number {
  return Math.max(0, Math.min(5, n));
}

function mergeFactorDeltas(...deltas: (Partial<BranchFactors> | undefined)[]): Partial<BranchFactors> {
  const merged: Partial<BranchFactors> = {};
  for (const delta of deltas) {
    if (!delta) continue;
    for (const key of Object.keys(delta) as (keyof BranchFactors)[]) {
      merged[key] = (merged[key] ?? 0) + (delta[key] as number);
    }
  }
  return merged;
}

/** Applies a category-level (and optional branch-level) nudge on top of
 * an archetype's baseline BranchFactors. This is the mechanism behind
 * Part 3 of v0.31: two branches sharing an archetype (e.g. "employed")
 * still land at different AI-risk/cost/autonomy estimates depending on
 * what kind of path they're on. */
function applyFactorDelta(base: BranchFactors, delta: Partial<BranchFactors>): BranchFactors {
  const result = { ...base };
  for (const key of Object.keys(delta) as (keyof BranchFactors)[]) {
    result[key] = clampFactor(base[key] + (delta[key] as number));
  }
  return result;
}

const ARCHETYPE_FIT: Record<BranchArchetype, TrailMapBranch["fit"]> = {
  entry: "High match",
  certification: "Worth exploring",
  apprenticeship: "Worth exploring",
  specialization: "Worth exploring",
  independent: "Consider",
  employed: "Consider",
  oversight: "Consider",
  business_owner: "Broader stretch",
  growth: "Broader stretch",
};

const ARCHETYPE_NODES: Record<BranchArchetype, [string, string, string]> = {
  entry: ["Learn the Basics", "Find Your First Opportunity", "Get Real Experience"],
  certification: ["Research Requirements", "Complete Required Training", "Pass Certification / Licensing"],
  apprenticeship: ["Find a Mentor or Sponsor", "Paid On-the-Job Training", "Complete Apprenticeship Hours"],
  specialization: ["Build Core Skills First", "Choose a Focus Area", "Gain Specialized Experience"],
  independent: ["Build a Portfolio or Track Record", "Find Your First Clients", "Build a Steady Pipeline"],
  employed: ["Apply to Relevant Roles", "Get Hired", "Grow Within the Role"],
  business_owner: ["Gain Real Experience First", "Build a Business Plan", "Launch Your Own Business"],
  growth: ["Build Real Experience", "Take on More Responsibility", "Move Into an Advanced Role"],
  oversight: ["Build Core Experience First", "Learn Standards or Requirements", "Move Into an Oversight Role"],
};

const ARCHETYPE_FACTORS_TEXT: Record<BranchArchetype, { typicalTime: string; education: string }> = {
  entry: { typicalTime: "Varies — often 6 months to 2 years to get started", education: "No formal requirement to begin — on-the-job learning" },
  certification: { typicalTime: "1 – 3 years, program and state dependent", education: "Certification or license required — program varies" },
  apprenticeship: { typicalTime: "2 – 5 years, program dependent", education: "Paid apprenticeship under a licensed mentor or sponsor" },
  specialization: { typicalTime: "1 – 2 years after the basics", education: "Builds on core skills; may need extra training or a portfolio" },
  independent: { typicalTime: "Can start once you have basic skills", education: "No formal requirement — reputation and portfolio matter more" },
  employed: { typicalTime: "Varies by employer", education: "Often on-the-job training; some employers prefer prior experience" },
  business_owner: { typicalTime: "Ongoing, after real experience", education: "Business or contractor licensing may apply depending on the field" },
  growth: { typicalTime: "Usually 3+ years of experience first", education: "Built on real experience, not a formal credential" },
  oversight: { typicalTime: "2 – 4 years of experience first", education: "Requires strong knowledge of standards or requirements" },
};

const ARCHETYPE_TRADEOFFS: Record<BranchArchetype, string[]> = {
  entry: [
    "Early progress can be slower than it looks from outside",
    "You may need to build basic skills before this feels real",
    "Finding the right entry point can take some searching",
  ],
  certification: [
    "Licensing or certification requirements vary a lot by state and governing body",
    "Programs can take longer and cost more than advertised",
    "Exams or certifications add real time and cost",
  ],
  apprenticeship: [
    "Apprenticeship slots can be competitive or have waitlists",
    "Pay is usually lower during the training years",
    "Quality depends heavily on your mentor or sponsor",
  ],
  specialization: [
    "Specializing narrows your options elsewhere",
    "May require additional training or a portfolio",
    "Demand for a narrow specialty can vary more than for generalists",
  ],
  independent: [
    "Income can be inconsistent, especially early on",
    "You handle your own admin, taxes, and client-finding",
    "No built-in support system if something goes wrong",
  ],
  employed: [
    "Less autonomy than working independently",
    "Pay ceiling is often set by the employer",
    "Culture and quality vary a lot by workplace",
  ],
  business_owner: [
    "Running a business adds real financial risk",
    "You'll spend real time on admin, not just the work itself",
    "Building a client base takes years, not months",
  ],
  growth: [
    "Requires real experience most people don't start with",
    "More responsibility usually comes with more pressure",
    "Fewer openings than entry-level roles",
  ],
  oversight: [
    "Requires strong knowledge of standards, not just hands-on skill",
    "Less hands-on work, more paperwork and oversight",
    "Fewer openings than field or frontline roles",
  ],
};

/** Lowercases a role for mid-sentence use without mangling acronyms
 * (HVAC, UX, AI, ...) that deriveRoleTitle preserved. */
function toMidSentenceCase(role: string): string {
  return role
    .split(/(\s+|\/)/)
    .map((word) => (/^[A-Z]{2,5}$/.test(word) ? word : word.toLowerCase()))
    .join("");
}

function archetypeNextStep(archetype: BranchArchetype, role: string): { title: string; description: string } {
  switch (archetype) {
    case "entry":
      return { title: "Talk to someone doing this now", description: `Ask what a real day as a ${toMidSentenceCase(role)} actually looks like before committing.` };
    case "certification":
      return { title: "Look up your state or local requirements", description: "Confirm exactly what's required before enrolling in any program." };
    case "apprenticeship":
      return { title: "Talk to a current apprentice", description: "Ask how they found their apprenticeship and what the hours actually involve." };
    case "specialization":
      return { title: "Talk to a specialist in this track", description: "Ask what made them choose this specialty over staying general." };
    case "independent":
      return { title: "Talk to someone doing this independently", description: "Ask how they found their first few clients or gigs." };
    case "employed":
      return { title: "Talk to someone currently in this role", description: "Ask what a real week looks like, not just the job description." };
    case "business_owner":
      return { title: "Talk to someone who's built this kind of business", description: "Ask what surprised them most about the business side." };
    case "growth":
      return { title: "Talk to someone in a senior version of this role", description: "Ask what actually changed for them at this stage." };
    case "oversight":
      return { title: "Talk to someone in this oversight role", description: "Ask what shifted most when they moved from the field to oversight." };
  }
}

function archetypePitch(archetype: BranchArchetype, role: string): string {
  const lower = toMidSentenceCase(role);
  switch (archetype) {
    case "entry":
      return `The most direct way to start moving toward ${lower} — learn by doing.`;
    case "certification":
      return "Building the credential or certification this path usually requires.";
    case "apprenticeship":
      return `A structured, paid way to learn ${lower} on the job under someone experienced.`;
    case "specialization":
      return `A focused track once you have the basics of ${lower} down.`;
    case "independent":
      return "Working for yourself instead of an employer.";
    case "employed":
      return `Working for an existing business or team as a ${lower}.`;
    case "business_owner":
      return `Running your own business built around ${lower} work.`;
    case "growth":
      return "A senior or advanced track for people with real experience already.";
    case "oversight":
      return "Moving from doing the work to overseeing or verifying it.";
  }
}

function archetypeWhyItFits(archetype: BranchArchetype): string {
  switch (archetype) {
    case "entry":
      return "The most direct path from where you are now — a low-commitment way to start.";
    case "certification":
      return "Worth prioritizing if this path in your area gates on a real license or certification.";
    case "apprenticeship":
      return "A strong fit if you want to earn while you learn, with real mentorship built in.";
    case "specialization":
      return "A fit once you know the fundamentals and want to go deeper in one direction.";
    case "independent":
      return "A fit if you want control over your schedule and clients, and can handle inconsistent income.";
    case "employed":
      return "A fit if you want structure, mentorship, and steadier income while you learn.";
    case "business_owner":
      return "Not an entry path — worth considering once you have real experience and want to build something of your own.";
    case "growth":
      return "Not an entry path — worth considering once you've built real experience and want more responsibility or income.";
    case "oversight":
      return "A fit if you want to use your knowledge in a less hands-on, more oversight-focused role.";
  }
}

type BranchSpec = {
  archetype: BranchArchetype;
  title: (role: string) => string;
  /** Overrides ARCHETYPE_NODES with milestones specific to this branch
   * (Part 2 of v0.31) — falls back to the generic archetype nodes when
   * omitted, which is why the "generic" category below doesn't set any. */
  nodes?: (role: string) => [string, string, string];
  /** Branch-specific scoring nudge on top of CATEGORY_FACTOR_DELTAS, for
   * the rare case where two branches share an archetype but shouldn't
   * share a score (e.g. a hands-on vs. an editing-heavy creative branch). */
  factorDelta?: Partial<BranchFactors>;
};

/** Branch titles (and, since v0.31, milestones) are tailored per category
 * rather than pulled from one shared template, so a generated map "feels
 * specific enough" (per the product direction) instead of reading like
 * the same six words with the role swapped in. */
const CATEGORY_BRANCHES: Record<PathCategory, BranchSpec[]> = {
  licensed_trade: [
    {
      archetype: "entry", title: (role) => `${role} Helper`,
      nodes: () => ["Ride Along or Helper Role", "Learn Tools and Safety", "Earn First Field Responsibilities"],
    },
    {
      archetype: "certification", title: () => "Trade School Path",
      nodes: () => ["Compare Programs", "Complete Required Training", "Prepare for Certification"],
    },
    {
      archetype: "apprenticeship", title: () => "Apprenticeship Path",
      nodes: () => ["Find Sponsor or Program", "Complete Paid Training Hours", "Document Required Experience"],
    },
    {
      archetype: "employed", title: (role) => `Residential ${role}`,
      nodes: () => ["Apply to Residential Employers", "Learn the Residential Side of the Trade", "Build a Steady Customer Base"],
    },
    {
      archetype: "specialization", title: (role) => `Commercial ${role}`,
      nodes: () => ["Learn the Commercial Side of the Trade", "Get Cross-Trained on More Equipment", "Take on Larger Job Sites"],
    },
    {
      archetype: "growth", title: () => "Controls / Advanced Systems Path",
      nodes: () => ["Learn Controls and Automation", "Get Manufacturer Certifications", "Take on Complex Systems Work"],
    },
    {
      archetype: "business_owner", title: (role) => `${role} Business Owner Path`,
      nodes: () => ["Get Licensed to Operate", "Build a Client Base", "Handle Scheduling and Billing"],
    },
  ],
  licensed_care: [
    {
      archetype: "entry", title: (role) => `${role} Support Role`,
      nodes: () => ["Shadow or Assist in the Role", "Learn Basic Patient Care Tasks", "Build Supervised Hours"],
    },
    {
      archetype: "certification", title: () => "Certification / Licensing Path",
      nodes: () => ["Enroll in an Accredited Program", "Complete Clinical Requirements", "Pass the Licensing Exam"],
    },
    {
      archetype: "employed", title: () => "Clinical Practice Path",
      nodes: () => ["Apply to Clinical Openings", "Complete Onboarding and Orientation", "Build a Caseload"],
    },
    {
      archetype: "specialization", title: () => "Specialization Path",
      nodes: () => ["Choose a Patient Population or Setting", "Get Additional Certification", "Build Specialized Experience"],
    },
    {
      archetype: "independent", title: () => "Private Practice Path",
      nodes: () => ["Build Required Clinical Hours", "Handle Licensing for Private Practice", "Find Your First Clients"],
    },
    {
      archetype: "growth", title: () => "Supervisory / Lead Path",
      nodes: () => ["Build Several Years of Experience", "Take on Mentoring Responsibilities", "Move Into a Lead Role"],
    },
    {
      archetype: "business_owner", title: (role) => `${role} Business Owner Path`,
      nodes: () => ["Get Licensed to Operate", "Build Referral Relationships", "Manage Staff and Compliance"],
    },
  ],
  creative_service: [
    {
      archetype: "entry", title: () => "Assistant / Second Path",
      nodes: (role) => [`Assist an Established ${role}`, "Learn How Real Jobs Actually Run", "Build Referral Relationships"],
    },
    {
      archetype: "specialization", title: () => "Portfolio-Building Path",
      nodes: () => ["Shoot Practice Sessions", "Build a Portfolio Website", "Collect Testimonials"],
    },
    {
      archetype: "independent", title: (role) => `Freelance ${role}`,
      nodes: () => ["Define Packages", "Book First Clients", "Build a Referral Pipeline"],
    },
    {
      archetype: "employed", title: () => "Studio / Agency Path",
      nodes: () => ["Apply to Studios or Agencies", "Learn Their Workflow and Style", "Build Your Own Client List Over Time"],
    },
    {
      archetype: "growth", title: () => "Premium / Luxury Market Path",
      nodes: () => ["Build a Standout Portfolio", "Target Higher-End Clients", "Raise Your Rates With Experience"],
    },
    {
      archetype: "specialization", title: () => "Editing / Production Specialist Path",
      nodes: () => ["Master Editing and Post-Production Tools", "Build a Specialized Portfolio", "Take on Editing-Only Work"],
      // AI tools most directly affect editing/post-production, unlike the
      // in-person, relationship-driven branches elsewhere in this category
      // (Part 3: "AI can affect editing/marketing, but human presence,
      // event trust, taste, and client relationship matter" elsewhere).
      factorDelta: { automationToolFit: 1, remoteDigitalWork: 2, routineCognitiveWork: 1, physicalPresenceNeed: -1 },
    },
    {
      archetype: "business_owner", title: (role) => `${role} Business Owner Path`,
      nodes: () => ["Formalize Contracts and Pricing", "Build a Business Around Your Work", "Manage Bookings and Finances"],
    },
  ],
  local_business: [
    {
      archetype: "employed", title: () => "Worker / Manager Path",
      nodes: () => ["Get Hired in the Industry", "Learn Day-to-Day Operations", "Move Into a Manager Role"],
    },
    {
      archetype: "entry", title: () => "Pop-Up / Side Hustle Path",
      nodes: () => ["Test the Idea on a Small Scale", "Get Real Customer Feedback", "Build a Repeatable Setup"],
    },
    {
      archetype: "independent", title: () => "Mobile / Low-Overhead Path",
      nodes: () => ["Choose a Low-Cost Format", "Handle Permits and Basic Licensing", "Build a Regular Customer Base"],
    },
    {
      archetype: "business_owner", title: (role) => `Small ${role}`,
      nodes: () => ["Write a Business Plan", "Secure a Location and Funding", "Open Your Doors"],
    },
    {
      archetype: "business_owner", title: () => "Franchise Path",
      nodes: () => ["Research Franchise Options", "Secure Financing", "Complete Franchisor Training"],
    },
    {
      archetype: "specialization", title: () => "Operations / Management Path",
      nodes: () => ["Learn Cost and Inventory Control", "Manage Staff and Scheduling", "Improve Margins Over Time"],
    },
    {
      archetype: "growth", title: () => "Multi-Location Owner Path",
      nodes: () => ["Systematize Your First Location", "Hire and Train Managers", "Open a Second Location"],
    },
  ],
  digital_knowledge: [
    {
      archetype: "entry", title: () => "Junior / Entry Role Path",
      nodes: () => ["Apply to Junior Roles", "Complete Onboarding Projects", "Build Real Work Experience"],
      // Junior/routine-adjacent work is the most exposed to existing
      // AI tools — Part 3: "should be more nuanced, probably Medium/High
      // for some branches."
      factorDelta: { routineCognitiveWork: 1, automationToolFit: 1 },
    },
    {
      archetype: "specialization", title: () => "Portfolio / Project-Building Path",
      nodes: () => ["Build a Real Project", "Document Your Process", "Publish Your Portfolio"],
    },
    {
      archetype: "specialization", title: () => "Specialist Track",
      nodes: () => ["Choose a Specialty Area", "Go Deep on One Toolset or Method", "Build Specialized Work Samples"],
    },
    {
      archetype: "independent", title: () => "Freelance / Contract Path",
      nodes: () => ["Define Your Services", "Find Your First Contract", "Build a Referral Pipeline"],
    },
    {
      archetype: "employed", title: () => "In-House / Team Path",
      nodes: () => ["Apply to In-House Roles", "Learn the Team's Tools and Process", "Grow Within the Team"],
    },
    {
      archetype: "growth", title: () => "Research / Advanced Track",
      nodes: () => ["Build Deep Domain Expertise", "Publish or Present Your Work", "Move Into an Advanced Role"],
      // Deep, judgment-heavy research work is the least automatable branch
      // in this category — the low end of the same "nuanced" spread.
      factorDelta: { routineCognitiveWork: -2, automationToolFit: -2, emotionalJudgmentNeed: 1, humanTrustNeed: 1 },
    },
    {
      archetype: "business_owner", title: () => "Independent Consultant Path",
      nodes: () => ["Build a Track Record First", "Define Your Consulting Offer", "Find Your First Clients"],
    },
  ],
  education_public: [
    {
      archetype: "entry", title: () => "Entry / Support Role Path",
      nodes: () => ["Volunteer or Assist in the Field", "Learn the Day-to-Day Work", "Build Relevant Experience"],
    },
    {
      archetype: "certification", title: () => "Certification / Credentialing Path",
      nodes: () => ["Enroll in a Certification Program", "Complete Required Fieldwork", "Earn Your Credential"],
    },
    {
      archetype: "employed", title: () => "Frontline Practice Path",
      nodes: () => ["Apply to Frontline Roles", "Complete Onboarding", "Build a Caseload or Classroom"],
    },
    {
      archetype: "specialization", title: () => "Specialization Path",
      nodes: () => ["Choose a Focus Population or Subject", "Get Additional Training", "Build Specialized Experience"],
    },
    {
      archetype: "growth", title: () => "Leadership / Administration Path",
      nodes: () => ["Build Several Years of Experience", "Take on Leadership Responsibilities", "Move Into an Administrative Role"],
    },
    {
      archetype: "independent", title: () => "Policy / Advocacy Path",
      nodes: () => ["Build Frontline Experience First", "Learn the Policy Landscape", "Get Involved in Advocacy Work"],
    },
    {
      archetype: "oversight", title: (role) => `${role} Director Path`,
      nodes: () => ["Build Deep Experience in the Field", "Take on Program Oversight", "Move Into a Director Role"],
    },
  ],
  generic: [
    { archetype: "entry", title: () => "Getting Started" },
    { archetype: "specialization", title: () => "Specialize" },
    { archetype: "independent", title: () => "Freelance / Independent Path" },
    { archetype: "employed", title: () => "Employed / Team Path" },
    { archetype: "business_owner", title: () => "Business Owner Path" },
    { archetype: "growth", title: () => "Advanced Path" },
  ],
};

/** Only wired for the two categories with a real example opportunity
 * seeded in lib/opportunities.ts (v0.32 Part 8) — every other category
 * gets no link rather than a made-up one. MapConfidenceNotice always
 * renders this as an explicit "Example access point," never as if it
 * were scouted for the user's specific area. */
const CATEGORY_EXAMPLE_OPPORTUNITY: Partial<Record<PathCategory, { slug: string; title: string }>> = {
  licensed_trade: { slug: "hvac-apprenticeship-info-session", title: "HVAC Apprenticeship Info Session" },
  creative_service: { slug: "wedding-photographer-assistant-opportunity", title: "Wedding Photographer Assistant Opportunity" },
};

const CATEGORY_DISCLAIMERS: Record<PathCategory, string> = {
  licensed_trade:
    "Licensing, apprenticeship, certification, and code requirements vary by state, municipality, union, employer, and governing body. Treat this as a starting map, not official guidance.",
  licensed_care:
    "Licensing, certification, supervision, and education requirements vary by state, institution, employer, and governing body. Treat this as a starting map, not official guidance.",
  creative_service:
    "Requirements vary by market, client type, equipment needs, portfolio quality, venue expectations, and business setup. Treat this as a starting map, not official guidance.",
  local_business:
    "Requirements vary by location, permits, startup costs, lease terms, suppliers, insurance, and local regulations. Treat this as a starting map, not official guidance.",
  digital_knowledge:
    "Requirements vary by employer, portfolio strength, technical depth, network, market demand, and proof of work. Treat this as a starting map, not official guidance.",
  education_public:
    "Requirements vary by state, institution, certification rules, employer, and role type. Treat this as a starting map, not official guidance.",
  generic:
    "Requirements and access points vary by location, market, institution, and role. Treat this as a starting map, not official guidance.",
};

const LICENSED_MILESTONES: Omit<TrailMilestone, "status">[] = [
  { id: "clarify", label: "Clarify the path" },
  { id: "licensing", label: "Understand local licensing" },
  { id: "apprenticeship", label: "Find an apprenticeship or helper role" },
  { id: "hours", label: "Build supervised hours or experience" },
  { id: "code-safety", label: "Learn tools, standards, and safety requirements" },
  { id: "exam", label: "Pass the licensing or certification step" },
  { id: "specialty", label: "Choose a specialty" },
  { id: "role-business", label: "Build your role or business" },
];

const GENERIC_MILESTONES: Omit<TrailMilestone, "status">[] = [
  { id: "clarify", label: "Clarify the path" },
  { id: "requirements", label: "Understand what this path actually requires" },
  { id: "entry", label: "Find your first real opportunity" },
  { id: "skills", label: "Build core skills and experience" },
  { id: "portfolio", label: "Build a portfolio or track record" },
  { id: "first-work", label: "Land your first paid work" },
  { id: "specialize", label: "Choose a specialization or direction" },
  { id: "role-business", label: "Build your role or business" },
];

const MILESTONE_STATUSES: TrailMilestone["status"][] = ["done", "done", "done", "current", "next", "future", "future", "future"];

function pathGuideForCategory(category: PathCategory, role: string): { cta: string; subtitle: string; badge: GuideBadge } {
  const licensed = LICENSED_CATEGORIES.includes(category);
  const badge: GuideBadge = licensed ? "Licensed guide" : "Verified experience";
  const subtitle = licensed
    ? "Ask what licensing, training, and day-to-day work actually require."
    : "Ask what this role actually looks like day to day, and what helped them get started.";
  const lower = toMidSentenceCase(role);

  if (licensed) return { cta: `Talk to a licensed ${lower}`, subtitle, badge };
  if (category === "local_business") return { cta: `Talk to a ${lower} or operator`, subtitle, badge };
  return { cta: `Talk to a working ${lower}`, subtitle, badge };
}

const CATEGORY_NOTE_TEMPLATES: Record<PathCategory, [string, string, string]> = {
  licensed_trade: [
    "Better first step: ask to shadow a job before committing to a program.",
    "Hidden friction: your first year may involve a lot of physical helper work.",
    "What opened doors: finding a reliable apprenticeship mattered more than online classes.",
  ],
  licensed_care: [
    "Better first step: shadow someone in this role before enrolling in a program.",
    "Hidden friction: supervised hours often take longer than programs advertise.",
    "Warning from someone ahead: caseload and supervision quality vary a ton by site.",
  ],
  creative_service: [
    "Better first step: assist or second-shoot for someone established before going solo.",
    "Hidden friction: the business side (contracts, invoicing, marketing) takes as much time as the craft.",
    "What opened doors: a strong portfolio mattered more than any certificate.",
  ],
  local_business: [
    "Better first step: work in the industry before opening your own place.",
    "Hidden friction: margins are thinner and hours longer than most people expect going in.",
    "What this required: real cash reserves for the slow months, not just the opening costs.",
  ],
  digital_knowledge: [
    "Better first step: build a small real project before applying anywhere.",
    "Hidden friction: portfolio quality matters more than credentials for a first role.",
    "What opened doors: one real project people could see mattered more than a course certificate.",
  ],
  education_public: [
    "Better first step: volunteer or shadow before committing to the credential.",
    "Hidden friction: funding and staffing for these roles can be inconsistent.",
    "What this required: patience with slow-moving institutions, not just the credential itself.",
  ],
  generic: [
    "Better first step: talk to someone already doing this before committing time or money.",
    "Hidden friction: the first stretch of any new path often takes longer than it looks from outside.",
    "What this required: showing up consistently mattered as much as any single skill.",
  ],
};

export function generateStarterTrailMap(goalText: string, context: GenerateTrailMapContext = {}): TrailMapGoal {
  const roleTitle = deriveRoleTitle(goalText);
  const category = classifyCategory(goalText);
  const licensed = LICENSED_CATEGORIES.includes(category);
  const goalSlug = slugify(roleTitle) || "generated-path";
  const branchSpecs = CATEGORY_BRANCHES[category];

  const branches: TrailMapBranch[] = branchSpecs.map((spec, i) => {
    const title = spec.title(roleTitle);
    const [n1, n2, n3] = spec.nodes ? spec.nodes(roleTitle) : ARCHETYPE_NODES[spec.archetype];
    const branchFactors = applyFactorDelta(
      ARCHETYPE_FACTORS[spec.archetype],
      mergeFactorDeltas(CATEGORY_FACTOR_DELTAS[category], spec.factorDelta)
    );
    return {
      id: `${goalSlug}-${slugify(title)}-${i}`,
      title,
      icon: ARCHETYPE_ICON[spec.archetype],
      fit: ARCHETYPE_FIT[spec.archetype],
      pitch: archetypePitch(spec.archetype, roleTitle),
      whyItFits: archetypeWhyItFits(spec.archetype),
      nodes: [
        { id: "n1", label: n1 },
        { id: "n2", label: n2 },
        { id: "n3", label: n3 },
      ],
      factors: ARCHETYPE_FACTORS_TEXT[spec.archetype],
      branchFactors,
      tradeoffs: ARCHETYPE_TRADEOFFS[spec.archetype],
      nextStep: archetypeNextStep(spec.archetype, roleTitle),
    };
  });

  const milestoneSpecs = licensed ? LICENSED_MILESTONES : GENERIC_MILESTONES;
  const milestones: TrailMilestone[] = milestoneSpecs.map((m, i) => ({
    ...m,
    status: MILESTONE_STATUSES[i],
  }));

  const locationNote = context.city
    ? ` Scout real access points near ${context.city}${context.state ? `, ${context.state}` : ""} to make this path more concrete.`
    : "";

  const noteTemplates = CATEGORY_NOTE_TEMPLATES[category];
  const notes: TrailNote[] = noteTemplates.map((body, i) => ({
    id: `generated-note-${i + 1}`,
    branchId: branches[0].id,
    author: "Example",
    role: "What people ahead often say",
    body,
    likes: 0,
  }));

  return {
    id: goalSlug,
    label: `Explore ${roleTitle}`,
    pathTitle: roleTitle,
    subtitle: `This is a starter map. Pathoro can begin mapping this path from your goal — explore, compare, and choose a branch, then verify requirements before relying on this.${locationNote}`,
    milestones,
    markersReached: 0,
    markersTotal: 8,
    defaultBranchId: branches[0].id,
    branches,
    notes,
    notesTotal: notes.length,
    notesAreExamples: true,
    confidence: "generated_starter",
    pathGuide: pathGuideForCategory(category, roleTitle),
    disclaimer: CATEGORY_DISCLAIMERS[category],
    exampleOpportunity: CATEGORY_EXAMPLE_OPPORTUNITY[category],
  };
}
