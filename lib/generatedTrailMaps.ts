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
type PathCategory =
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

function classifyCategory(goalText: string): PathCategory {
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

type BranchSpec = { archetype: BranchArchetype; title: (role: string) => string };

/** Branch titles are tailored per category rather than pulled from one
 * shared template, so a generated map "feels specific enough" (per the
 * product direction) instead of reading like the same six words with
 * the role swapped in. */
const CATEGORY_BRANCHES: Record<PathCategory, BranchSpec[]> = {
  licensed_trade: [
    { archetype: "entry", title: (role) => `${role} Helper` },
    { archetype: "certification", title: () => "Trade School Path" },
    { archetype: "apprenticeship", title: () => "Apprenticeship Path" },
    { archetype: "employed", title: (role) => `Residential ${role}` },
    { archetype: "specialization", title: (role) => `Commercial ${role}` },
    { archetype: "growth", title: () => "Controls / Advanced Systems Path" },
    { archetype: "business_owner", title: (role) => `${role} Business Owner Path` },
  ],
  licensed_care: [
    { archetype: "entry", title: (role) => `${role} Support Role` },
    { archetype: "certification", title: () => "Certification / Licensing Path" },
    { archetype: "employed", title: () => "Clinical Practice Path" },
    { archetype: "specialization", title: () => "Specialization Path" },
    { archetype: "independent", title: () => "Private Practice Path" },
    { archetype: "growth", title: () => "Supervisory / Lead Path" },
    { archetype: "business_owner", title: (role) => `${role} Business Owner Path` },
  ],
  creative_service: [
    { archetype: "entry", title: () => "Assistant / Second Path" },
    { archetype: "specialization", title: () => "Portfolio-Building Path" },
    { archetype: "independent", title: (role) => `Freelance ${role}` },
    { archetype: "employed", title: () => "Studio / Agency Path" },
    { archetype: "growth", title: () => "Premium / Luxury Market Path" },
    { archetype: "specialization", title: () => "Editing / Production Specialist Path" },
    { archetype: "business_owner", title: (role) => `${role} Business Owner Path` },
  ],
  local_business: [
    { archetype: "employed", title: () => "Worker / Manager Path" },
    { archetype: "entry", title: () => "Pop-Up / Side Hustle Path" },
    { archetype: "independent", title: () => "Mobile / Low-Overhead Path" },
    { archetype: "business_owner", title: (role) => `Small ${role}` },
    { archetype: "business_owner", title: () => "Franchise Path" },
    { archetype: "specialization", title: () => "Operations / Management Path" },
    { archetype: "growth", title: () => "Multi-Location Owner Path" },
  ],
  digital_knowledge: [
    { archetype: "entry", title: () => "Junior / Entry Role Path" },
    { archetype: "specialization", title: () => "Portfolio / Project-Building Path" },
    { archetype: "specialization", title: () => "Specialist Track" },
    { archetype: "independent", title: () => "Freelance / Contract Path" },
    { archetype: "employed", title: () => "In-House / Team Path" },
    { archetype: "growth", title: () => "Research / Advanced Track" },
    { archetype: "business_owner", title: () => "Independent Consultant Path" },
  ],
  education_public: [
    { archetype: "entry", title: () => "Entry / Support Role Path" },
    { archetype: "certification", title: () => "Certification / Credentialing Path" },
    { archetype: "employed", title: () => "Frontline Practice Path" },
    { archetype: "specialization", title: () => "Specialization Path" },
    { archetype: "growth", title: () => "Leadership / Administration Path" },
    { archetype: "independent", title: () => "Policy / Advocacy Path" },
    { archetype: "oversight", title: (role) => `${role} Director Path` },
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
    const [n1, n2, n3] = ARCHETYPE_NODES[spec.archetype];
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
      branchFactors: ARCHETYPE_FACTORS[spec.archetype],
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
  };
}
