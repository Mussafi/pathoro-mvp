import {
  Briefcase,
  Compass,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { BranchFactors } from "@/lib/trailMapScoring";
import type { TrailMapBranch, TrailMapGoal, TrailMilestone } from "@/lib/trailMapData";

/**
 * Deterministic heuristic generator for Trail Map drafts — the fallback
 * for any goal that doesn't match a curated template (see
 * lib/goalSpecificity.ts's mapGoalToTrailMapGoal). No LLM is wired up
 * yet; this produces a same-shaped TrailMapGoal from keyword
 * classification and fixed archetype data.
 *
 * The seam for a future AI provider is this function's signature and
 * return shape: a provider-backed generator would take the same
 * { goalText, city, state, userContext } input and return the same
 * TrailMapGoal, just with real research behind the branches instead of
 * a generic archetype. Swapping one in means adding a branch here, not
 * redesigning the data model or the UI that renders it. Every draft
 * this produces is marked confidence: "generated_starter" — see
 * docs/V0.30-DYNAMIC-TRAIL-MAPS.md.
 */

export type GenerateTrailMapInput = {
  goalText: string;
  city?: string;
  state?: string;
  /** Accepted for a future AI provider (onboarding answers, etc.) —
   * not used by the deterministic heuristic today. */
  userContext?: string;
};

type BranchArchetype =
  | "entry"
  | "certification"
  | "specialization"
  | "independent"
  | "employed"
  | "business_owner"
  | "growth"
  | "oversight";

type GoalShape = "regulated" | "creative" | "business" | "generic";

const REGULATED_PATTERN =
  /licensed|licensing|certified|certificate|technician|therapist|assistant|nurse|hygienist|electrician|plumber|hvac|cosmetol|real estate|pharmacist|paralegal|dental|physical therapist|medical|clinical/i;
const BUSINESS_PATTERN = /business|restaurant|owner|shop|import|export|entrepreneur|startup|store/i;
const CREATIVE_PATTERN =
  /photographer|designer|writer|artist|videographer|stylist|illustrator|filmmaker|musician|developer|\bux\b|\bui\b/i;

function classifyGoalShape(goalText: string): GoalShape {
  if (REGULATED_PATTERN.test(goalText)) return "regulated";
  if (BUSINESS_PATTERN.test(goalText)) return "business";
  if (CREATIVE_PATTERN.test(goalText)) return "creative";
  return "generic";
}

const ACRONYMS: Record<string, string> = { ux: "UX", ui: "UI", hvac: "HVAC", it: "IT" };
const LOWERCASE_WORDS = new Set(["a", "an", "the", "of", "in", "to", "for", "and", "or"]);

/** "become a licensed plumber" -> "Licensed Plumber". Strips leading
 * "become a/an" framing and title-cases the remaining role phrase,
 * preserving known acronyms (ux, hvac). */
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
  specialization: GraduationCap,
  independent: UserCog,
  employed: Users,
  business_owner: Store,
  growth: Rocket,
  oversight: Briefcase,
};

const ARCHETYPE_FACTORS: Record<BranchArchetype, BranchFactors> = {
  entry: {
    routineCognitiveWork: 1,
    automationToolFit: 1,
    remoteDigitalWork: 1,
    humanTrustNeed: 2,
    regulationBarrier: 2,
    physicalPresenceNeed: 3,
    emotionalJudgmentNeed: 2,
    marketDemand: 4,
    incomeUpside: 2,
    autonomyPotential: 2,
    upfrontCost: 2,
    timeToCredential: 2,
    emotionalLoad: 2,
    relationshipLeverage: 2,
    opportunityLeverage: 3,
  },
  certification: {
    routineCognitiveWork: 1,
    automationToolFit: 1,
    remoteDigitalWork: 0,
    humanTrustNeed: 3,
    regulationBarrier: 4,
    physicalPresenceNeed: 3,
    emotionalJudgmentNeed: 3,
    marketDemand: 4,
    incomeUpside: 3,
    autonomyPotential: 2,
    upfrontCost: 2,
    timeToCredential: 3,
    emotionalLoad: 2,
    relationshipLeverage: 2,
    opportunityLeverage: 3,
  },
  specialization: {
    routineCognitiveWork: 2,
    automationToolFit: 2,
    remoteDigitalWork: 1,
    humanTrustNeed: 3,
    regulationBarrier: 2,
    physicalPresenceNeed: 3,
    emotionalJudgmentNeed: 3,
    marketDemand: 3,
    incomeUpside: 3,
    autonomyPotential: 3,
    upfrontCost: 2,
    timeToCredential: 2,
    emotionalLoad: 2,
    relationshipLeverage: 3,
    opportunityLeverage: 3,
  },
  independent: {
    routineCognitiveWork: 1,
    automationToolFit: 2,
    remoteDigitalWork: 2,
    humanTrustNeed: 3,
    regulationBarrier: 1,
    physicalPresenceNeed: 2,
    emotionalJudgmentNeed: 2,
    marketDemand: 3,
    incomeUpside: 3,
    autonomyPotential: 5,
    upfrontCost: 2,
    timeToCredential: 1,
    emotionalLoad: 2,
    relationshipLeverage: 3,
    opportunityLeverage: 3,
  },
  employed: {
    routineCognitiveWork: 2,
    automationToolFit: 2,
    remoteDigitalWork: 2,
    humanTrustNeed: 2,
    regulationBarrier: 1,
    physicalPresenceNeed: 2,
    emotionalJudgmentNeed: 2,
    marketDemand: 3,
    incomeUpside: 3,
    autonomyPotential: 2,
    upfrontCost: 1,
    timeToCredential: 1,
    emotionalLoad: 2,
    relationshipLeverage: 2,
    opportunityLeverage: 3,
  },
  business_owner: {
    routineCognitiveWork: 2,
    automationToolFit: 1,
    remoteDigitalWork: 1,
    humanTrustNeed: 4,
    regulationBarrier: 3,
    physicalPresenceNeed: 2,
    emotionalJudgmentNeed: 3,
    marketDemand: 3,
    incomeUpside: 5,
    autonomyPotential: 5,
    upfrontCost: 4,
    timeToCredential: 4,
    emotionalLoad: 3,
    relationshipLeverage: 4,
    opportunityLeverage: 4,
  },
  growth: {
    routineCognitiveWork: 2,
    automationToolFit: 2,
    remoteDigitalWork: 2,
    humanTrustNeed: 3,
    regulationBarrier: 1,
    physicalPresenceNeed: 2,
    emotionalJudgmentNeed: 3,
    marketDemand: 3,
    incomeUpside: 4,
    autonomyPotential: 4,
    upfrontCost: 2,
    timeToCredential: 2,
    emotionalLoad: 2,
    relationshipLeverage: 3,
    opportunityLeverage: 4,
  },
  oversight: {
    routineCognitiveWork: 3,
    automationToolFit: 2,
    remoteDigitalWork: 2,
    humanTrustNeed: 3,
    regulationBarrier: 5,
    physicalPresenceNeed: 2,
    emotionalJudgmentNeed: 3,
    marketDemand: 3,
    incomeUpside: 3,
    autonomyPotential: 4,
    upfrontCost: 2,
    timeToCredential: 3,
    emotionalLoad: 2,
    relationshipLeverage: 3,
    opportunityLeverage: 3,
  },
};

const ARCHETYPE_FIT: Record<BranchArchetype, TrailMapBranch["fit"]> = {
  entry: "High match",
  certification: "Worth exploring",
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
  specialization: ["Build Core Skills First", "Choose a Focus Area", "Gain Specialized Experience"],
  independent: ["Build a Portfolio or Track Record", "Find Your First Clients", "Build a Steady Pipeline"],
  employed: ["Apply to Relevant Roles", "Get Hired", "Grow Within the Role"],
  business_owner: ["Gain Real Experience First", "Build a Business Plan", "Launch Your Own Business"],
  growth: ["Build Real Experience", "Take on More Responsibility", "Move Into an Advanced Role"],
  oversight: ["Build Core Experience First", "Learn Standards or Code Requirements", "Move Into an Oversight Role"],
};

const ARCHETYPE_FACTORS_TEXT: Record<BranchArchetype, { typicalTime: string; education: string }> = {
  entry: { typicalTime: "Varies — often 6 months to 2 years to get started", education: "No formal requirement to begin — on-the-job learning" },
  certification: { typicalTime: "1 – 3 years, program and state dependent", education: "Certification or license required — program varies" },
  specialization: { typicalTime: "1 – 2 years after the basics", education: "Builds on core skills; may need extra training or a portfolio" },
  independent: { typicalTime: "Can start once you have basic skills", education: "No formal requirement — reputation and portfolio matter more" },
  employed: { typicalTime: "Varies by employer", education: "Often on-the-job training; some employers prefer prior experience" },
  business_owner: { typicalTime: "Ongoing, after real experience", education: "Business or contractor licensing may apply depending on the field" },
  growth: { typicalTime: "Usually 3+ years of experience first", education: "Built on real experience, not a formal credential" },
  oversight: { typicalTime: "2 – 4 years of experience first", education: "Requires strong knowledge of standards, codes, or requirements" },
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
    "Requires strong knowledge of standards or code, not just hands-on skill",
    "Less hands-on work, more paperwork and oversight",
    "Fewer openings than field or frontline roles",
  ],
};

function archetypeNextStep(archetype: BranchArchetype, role: string): { title: string; description: string } {
  switch (archetype) {
    case "entry":
      return { title: "Talk to someone doing this now", description: `Ask what a real day as a ${role.toLowerCase()} actually looks like before committing.` };
    case "certification":
      return { title: "Look up your state or local requirements", description: "Confirm exactly what's required before enrolling in any program." };
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
  const lower = role.toLowerCase();
  switch (archetype) {
    case "entry":
      return `The most direct way to start moving toward ${lower} — learn by doing.`;
    case "certification":
      return "Building the credential or certification this path usually requires.";
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

type ShapeBranchSpec = { archetype: BranchArchetype; title: (role: string) => string };

const SHAPE_BRANCHES: Record<GoalShape, ShapeBranchSpec[]> = {
  regulated: [
    { archetype: "entry", title: () => "Entry / Apprentice Path" },
    { archetype: "certification", title: () => "Certification / Licensing Path" },
    { archetype: "specialization", title: (role) => `${role} Specialist Path` },
    { archetype: "independent", title: () => "Independent / Contractor Path" },
    { archetype: "employed", title: () => "Employed / Team Path" },
    { archetype: "business_owner", title: (role) => `${role} Business Owner Path` },
    { archetype: "oversight", title: () => "Inspection / Oversight Path" },
  ],
  creative: [
    { archetype: "entry", title: () => "Getting Started" },
    { archetype: "specialization", title: () => "Niche Specialization Path" },
    { archetype: "independent", title: () => "Freelance / Independent Path" },
    { archetype: "employed", title: () => "Studio / Agency Path" },
    { archetype: "business_owner", title: () => "Business Owner / Studio Founder Path" },
    { archetype: "growth", title: () => "Advanced / Leadership Path" },
  ],
  business: [
    { archetype: "entry", title: () => "Explore the Idea" },
    { archetype: "employed", title: () => "Learn the Operations (Work for Someone Else First)" },
    { archetype: "specialization", title: () => "Build a Business Plan" },
    { archetype: "independent", title: () => "Launch Path (Solo / Bootstrapped)" },
    { archetype: "business_owner", title: (role) => `Open Your Own ${role.replace(/\s+Owner$/i, "")}` },
    { archetype: "growth", title: () => "Scale / Multi-Location Path" },
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

const REGULATED_MILESTONES: Omit<TrailMilestone, "status">[] = [
  { id: "clarify", label: "Clarify the path" },
  { id: "licensing", label: "Understand local licensing" },
  { id: "apprenticeship", label: "Find an apprenticeship or helper role" },
  { id: "hours", label: "Build supervised hours or experience" },
  { id: "code-safety", label: "Learn tools, code, and safety requirements" },
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

export function generateTrailMapDraft(input: GenerateTrailMapInput): TrailMapGoal {
  const roleTitle = deriveRoleTitle(input.goalText);
  const shape = classifyGoalShape(input.goalText);
  const regulated = shape === "regulated";
  const goalSlug = slugify(roleTitle) || "generated-path";
  const branchSpecs = SHAPE_BRANCHES[shape];

  const branches: TrailMapBranch[] = branchSpecs.map((spec) => {
    const title = spec.title(roleTitle);
    const [n1, n2, n3] = ARCHETYPE_NODES[spec.archetype];
    return {
      id: `${goalSlug}-${slugify(title)}`,
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
      branchFactors: ARCHETYPE_FACTORS[spec.archetype],
      tradeoffs: ARCHETYPE_TRADEOFFS[spec.archetype],
      nextStep: archetypeNextStep(spec.archetype, roleTitle),
    };
  });

  const milestoneSpecs = regulated ? REGULATED_MILESTONES : GENERIC_MILESTONES;
  const milestones: TrailMilestone[] = milestoneSpecs.map((m, i) => ({
    ...m,
    status: MILESTONE_STATUSES[i],
  }));

  const locationNote = input.city
    ? ` Pathoro will look for real-world access points near ${input.city}${input.state ? `, ${input.state}` : ""} once you're ready.`
    : "";

  return {
    id: goalSlug,
    label: `Explore ${roleTitle}`,
    pathTitle: roleTitle,
    subtitle: `Pathoro generated a first-pass map for this path from your goal. Explore, compare, and choose the branch that fits — then verify the details that matter.${locationNote}`,
    milestones,
    markersReached: 0,
    markersTotal: 8,
    defaultBranchId: branches[0].id,
    branches,
    notes: [
      {
        id: "generated-note-1",
        branchId: branches[0].id,
        author: "Example",
        role: "What people ahead often say",
        body: "Better first step: talk to someone already doing this before committing time or money.",
        likes: 0,
      },
      {
        id: "generated-note-2",
        branchId: branches[0].id,
        author: "Example",
        role: "What people ahead often say",
        body: "Hidden friction: the first stretch of any new path often takes longer than it looks from outside.",
        likes: 0,
      },
    ],
    notesTotal: 2,
    confidence: "generated_starter",
    pathGuide: {
      cta: `Talk to someone working as a ${roleTitle}`,
      subtitle: "Pathoro hasn't verified what kind of guide fits this path yet — treat this as a starting point.",
      badge: "Credential not verified",
    },
  };
}
