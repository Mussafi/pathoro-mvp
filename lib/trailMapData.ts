import {
  Activity,
  Brain,
  Briefcase,
  ChefHat,
  GraduationCap,
  HandHeart,
  Handshake,
  Home,
  Megaphone,
  Package,
  School,
  ShoppingBag,
  Shirt,
  Store,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type TrailMapGoalId = "therapist" | "vegetarian" | "resale";

export type MilestoneStatus = "done" | "current" | "next" | "future";

export type TrailMilestone = {
  id: string;
  label: string;
  status: MilestoneStatus;
  detail?: string;
};

export type FitLevel = "High match" | "Worth exploring" | "Consider" | "Broader stretch";

export type RatingLevel = "Very Low" | "Low" | "Medium" | "High" | "Very High";

export type TrailMapFactors = {
  typicalTime: string;
  education: string;
  costFriction: string;
  incomePotential: string;
  autonomy: string;
  emotionalIntensity: string;
  aiRisk: RatingLevel;
  demand: RatingLevel;
};

export type TrailMapNode = {
  id: string;
  label: string;
};

export type TrailMapBranch = {
  id: string;
  title: string;
  icon: LucideIcon;
  fit: FitLevel;
  whyItFits: string;
  nodes: [TrailMapNode, TrailMapNode, TrailMapNode];
  factors: TrailMapFactors;
  tradeoffs: string[];
  nextStep: { title: string; description: string };
};

export type TrailNote = {
  id: string;
  branchId: string;
  author: string;
  role: string;
  body: string;
  likes: number;
  verified?: boolean;
};

export type TrailMapGoal = {
  id: TrailMapGoalId;
  label: string;
  pathTitle: string;
  subtitle: string;
  milestones: TrailMilestone[];
  markersReached: number;
  markersTotal: number;
  defaultBranchId: string;
  branches: TrailMapBranch[];
  notes: TrailNote[];
  notesTotal: number;
};

const RATING_FAVORABLE: Record<"aiRisk" | "demand", RatingLevel[]> = {
  aiRisk: ["Very Low", "Low"],
  demand: ["High", "Very High"],
};

export function isFavorableRating(kind: "aiRisk" | "demand", value: RatingLevel): boolean {
  return RATING_FAVORABLE[kind].includes(value);
}

const RATING_ORDER: RatingLevel[] = ["Very Low", "Low", "Medium", "High", "Very High"];

/** 1-5 fill count for a rating dot-strip, oriented so a higher fill always
 * means "more favorable" — aiRisk is reversed (Very Low risk = full dots)
 * since lower is better there, while demand is read directly (Very High
 * demand = full dots). */
export function getRatingFillCount(kind: "aiRisk" | "demand", value: RatingLevel): number {
  const index = RATING_ORDER.indexOf(value);
  if (index === -1) return 0;
  return kind === "demand" ? index + 1 : RATING_ORDER.length - index;
}

/** Per-branch accent color for unselected map icons — purely visual, gives
 * each path its own identity the way the reference map's colored category
 * icons do. Selected state always overrides to green regardless of accent. */
export type BranchAccent = "teal" | "purple" | "rose" | "indigo" | "amber" | "orange" | "slate" | "red" | "blue";

const BRANCH_ACCENTS: Record<string, BranchAccent> = {
  // Therapist
  "clinical-mental-health-counselor": "teal",
  "marriage-family-therapist": "purple",
  "clinical-social-worker": "rose",
  psychologist: "indigo",
  "school-counselor": "amber",
  "somatic-therapist": "orange",
  "private-practice": "slate",
  // Vegetarian
  "health-route": "red",
  "cooking-skill-route": "amber",
  "community-route": "purple",
  "ethical-activism-route": "rose",
  "food-business-route": "teal",
  "low-friction-habit-route": "blue",
  // Resale business
  "flea-market-sourcing": "amber",
  "ebay-resale": "blue",
  "vintage-clothing": "purple",
  "estate-sales": "teal",
  "repair-refurbish": "orange",
  "vendor-markets": "rose",
  "supplier-relationships": "indigo",
};

export function getBranchAccent(branchId: string): BranchAccent {
  return BRANCH_ACCENTS[branchId] ?? "slate";
}

export type BranchAccentClasses = {
  /** Icon circle background (unselected map icon). */
  bg: string;
  /** Icon glyph / accent text color. */
  text: string;
  /** Icon circle border. */
  border: string;
  /** Solid dot — comparison card indicator, note avatar. */
  dot: string;
  /** Faint tint for an unselected comparison card's left accent + wash. */
  cardBorder: string;
  cardBg: string;
};

/** One shared color set per accent, reused everywhere a branch's identity
 * shows up (map icon, comparison card, note avatar) so the same path reads
 * as the same color across the whole page — see "Branch color consistency"
 * in the v0.22 task notes. */
const ACCENT_CLASSES: Record<BranchAccent, BranchAccentClasses> = {
  teal: { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-300", dot: "bg-teal-500", cardBorder: "border-teal-200", cardBg: "bg-teal-50/60" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-300", dot: "bg-purple-500", cardBorder: "border-purple-200", cardBg: "bg-purple-50/60" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-300", dot: "bg-rose-500", cardBorder: "border-rose-200", cardBg: "bg-rose-50/60" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-300", dot: "bg-indigo-500", cardBorder: "border-indigo-200", cardBg: "bg-indigo-50/60" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-300", dot: "bg-amber-500", cardBorder: "border-amber-200", cardBg: "bg-amber-50/60" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-300", dot: "bg-orange-500", cardBorder: "border-orange-200", cardBg: "bg-orange-50/60" },
  slate: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-500", cardBorder: "border-slate-200", cardBg: "bg-slate-50/60" },
  red: { bg: "bg-red-100", text: "text-red-600", border: "border-red-300", dot: "bg-red-500", cardBorder: "border-red-200", cardBg: "bg-red-50/60" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-300", dot: "bg-blue-500", cardBorder: "border-blue-200", cardBg: "bg-blue-50/60" },
};

export function getBranchAccentClasses(branchId: string): BranchAccentClasses {
  return ACCENT_CLASSES[getBranchAccent(branchId)];
}

const therapistGoal: TrailMapGoal = {
  id: "therapist",
  label: "Become a therapist",
  pathTitle: "Licensed Therapist",
  subtitle:
    "You've clarified your direction. Many licensure paths are open to you — explore, compare, and choose the one that fits.",
  milestones: [
    { id: "exploring", label: "Exploring therapy path", status: "done" },
    { id: "clarify", label: "Clarify therapy direction", status: "done" },
    { id: "requirements", label: "Understand requirements", status: "done" },
    { id: "degree", label: "Choose degree path", status: "current" },
    { id: "supervised", label: "Gain supervised experience", status: "next" },
    { id: "licensure", label: "Licensure / credentialing", status: "future" },
    { id: "specialization", label: "Choose specialization", status: "future" },
    { id: "practice", label: "Build role / practice", status: "future" },
  ],
  markersReached: 3,
  markersTotal: 8,
  defaultBranchId: "clinical-mental-health-counselor",
  branches: [
    {
      id: "clinical-mental-health-counselor",
      title: "Clinical Mental Health Counselor",
      icon: Brain,
      fit: "High match",
      whyItFits:
        "The most direct path from where you are now — broad scope of practice and the most training programs to choose from.",
      nodes: [
        { id: "n1", label: "Master's in Counseling" },
        { id: "n2", label: "Supervised Hours" },
        { id: "n3", label: "LPC Licensure" },
      ],
      factors: {
        typicalTime: "2 – 4 years",
        education: "Master's degree",
        costFriction: "$$$",
        incomePotential: "$$",
        autonomy: "Medium",
        emotionalIntensity: "High",
        aiRisk: "Very Low",
        demand: "Very High",
      },
      tradeoffs: [
        "Supervised hours can take longer than programs advertise",
        "Licensure exam adds real cost and time",
        "Emotionally demanding work most days",
      ],
      nextStep: {
        title: "Talk to a licensed counselor",
        description: "Learn what a real caseload and supervision year actually look like.",
      },
    },
    {
      id: "marriage-family-therapist",
      title: "Marriage & Family Therapist",
      icon: Users,
      fit: "Worth exploring",
      whyItFits:
        "A strong fit if you're drawn to relational and systemic work rather than individual-only therapy.",
      nodes: [
        { id: "n1", label: "MFT Master's Program" },
        { id: "n2", label: "Practicum Placement" },
        { id: "n3", label: "LMFT Licensure" },
      ],
      factors: {
        typicalTime: "2 – 3 years",
        education: "Master's degree",
        costFriction: "$$$",
        incomePotential: "$$",
        autonomy: "Medium",
        emotionalIntensity: "High",
        aiRisk: "Very Low",
        demand: "High",
      },
      tradeoffs: [
        "Fewer MFT programs than general counseling programs",
        "Some states license MFTs differently than LPCs",
        "Couples/family sessions can be higher-conflict",
      ],
      nextStep: {
        title: "Sit in on a family session (with permission)",
        description: "See what systemic work feels like before committing to a program.",
      },
    },
    {
      id: "clinical-social-worker",
      title: "Clinical Social Worker",
      icon: HandHeart,
      fit: "Worth exploring",
      whyItFits:
        "Good fit if you want therapy skills plus a broader toolkit for case management and systems-level advocacy.",
      nodes: [
        { id: "n1", label: "MSW Program" },
        { id: "n2", label: "Field Placement" },
        { id: "n3", label: "LCSW Licensure" },
      ],
      factors: {
        typicalTime: "2 – 3 years",
        education: "Master's degree (MSW)",
        costFriction: "$$",
        incomePotential: "$$",
        autonomy: "Medium",
        emotionalIntensity: "High",
        aiRisk: "Very Low",
        demand: "Very High",
      },
      tradeoffs: [
        "Field placements are often unpaid",
        "Broader scope means more generalist training up front",
        "High burnout roles in some settings (hospitals, schools)",
      ],
      nextStep: {
        title: "Shadow a clinical social worker",
        description: "Ask what a typical week looks like across a full caseload.",
      },
    },
    {
      id: "psychologist",
      title: "Psychologist",
      icon: GraduationCap,
      fit: "Consider",
      whyItFits:
        "The deepest training path — worth considering if you want to do assessment, research, or teach as well as treat.",
      nodes: [
        { id: "n1", label: "Doctoral Program (PhD/PsyD)" },
        { id: "n2", label: "Predoctoral Internship" },
        { id: "n3", label: "State Licensure" },
      ],
      factors: {
        typicalTime: "5 – 7 years",
        education: "Doctoral degree",
        costFriction: "$$$$",
        incomePotential: "$$$",
        autonomy: "High",
        emotionalIntensity: "High",
        aiRisk: "Very Low",
        demand: "High",
      },
      tradeoffs: [
        "Longest and most expensive licensure path here",
        "Internship placements are competitive and often require relocating",
        "Years before you're independently practicing",
      ],
      nextStep: {
        title: "Talk to a current doctoral student",
        description: "Understand the real timeline and funding situation before applying.",
      },
    },
    {
      id: "school-counselor",
      title: "School Counselor",
      icon: School,
      fit: "Consider",
      whyItFits:
        "A fit if you want steadier hours and to work with young people inside an existing institution.",
      nodes: [
        { id: "n1", label: "School Counseling Degree" },
        { id: "n2", label: "Practicum in a School" },
        { id: "n3", label: "State Certification" },
      ],
      factors: {
        typicalTime: "2 years",
        education: "Master's degree",
        costFriction: "$$",
        incomePotential: "$",
        autonomy: "Low",
        emotionalIntensity: "Medium",
        aiRisk: "Low",
        demand: "High",
      },
      tradeoffs: [
        "Scope of practice is narrower than clinical counseling",
        "Tied to a school district's calendar and bureaucracy",
        "Lower pay ceiling than clinical roles",
      ],
      nextStep: {
        title: "Talk to a school counselor",
        description: "Ask what's actually clinical work versus administrative work in the role.",
      },
    },
    {
      id: "somatic-therapist",
      title: "Somatic / Body-Oriented Therapist",
      icon: Activity,
      fit: "Broader stretch",
      whyItFits:
        "A less conventional path — worth a look if you're drawn to body-based, non-talk-only approaches to healing.",
      nodes: [
        { id: "n1", label: "Somatic Training Program" },
        { id: "n2", label: "Supervised Practice Hours" },
        { id: "n3", label: "Certification / Licensure Path" },
      ],
      factors: {
        typicalTime: "1 – 3 years",
        education: "Certificate or license, varies by state",
        costFriction: "$$",
        incomePotential: "$$",
        autonomy: "High",
        emotionalIntensity: "Medium",
        aiRisk: "Very Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Regulation varies a lot by state — verify before enrolling",
        "Fewer standardized programs to compare",
        "Insurance reimbursement is less consistent",
      ],
      nextStep: {
        title: "Take an intro somatic workshop",
        description: "Experience the modality yourself before training to practice it.",
      },
    },
    {
      id: "private-practice",
      title: "Private Practice Path",
      icon: Briefcase,
      fit: "Broader stretch",
      whyItFits:
        "Not a separate license — a business layer on top of any clinical path, once you've built enough hours and clients.",
      nodes: [
        { id: "n1", label: "Build Clinical Hours" },
        { id: "n2", label: "Business & Billing Setup" },
        { id: "n3", label: "Open Your Own Practice" },
      ],
      factors: {
        typicalTime: "Ongoing, after licensure",
        education: "Requires an existing clinical license",
        costFriction: "$$",
        incomePotential: "$$$",
        autonomy: "Very High",
        emotionalIntensity: "Medium",
        aiRisk: "Low",
        demand: "High",
      },
      tradeoffs: [
        "You're running a small business, not just practicing therapy",
        "Income is inconsistent in the first year or two",
        "No employer-provided benefits or referral pipeline",
      ],
      nextStep: {
        title: "Talk to a therapist in private practice",
        description: "Ask what running the business side actually takes each week.",
      },
    },
  ],
  notes: [
    {
      id: "note-1",
      branchId: "clinical-mental-health-counselor",
      author: "Dana",
      role: "LPC, 4 years",
      body: "Talk to someone in this role before paying for a program. Supervision quality varies a ton.",
      likes: 41,
      verified: true,
    },
    {
      id: "note-2",
      branchId: "clinical-mental-health-counselor",
      author: "Marcus",
      role: "Counseling grad student",
      body: "Ask about supervision hours early — this took longer than my program advertised.",
      likes: 27,
    },
    {
      id: "note-3",
      branchId: "psychologist",
      author: "Priya",
      role: "PsyD, 2 years post-licensure",
      body: "Hidden friction: funding and relocating for internship. Ask programs directly about placement rates.",
      likes: 33,
      verified: true,
    },
    {
      id: "note-4",
      branchId: "private-practice",
      author: "Jordan",
      role: "Private practice owner",
      body: "Better first step: build a caseload inside a group practice before going fully independent.",
      likes: 19,
    },
  ],
  notesTotal: 128,
};

const vegetarianGoal: TrailMapGoal = {
  id: "vegetarian",
  label: "Become vegetarian",
  pathTitle: "Vegetarian Lifestyle",
  subtitle:
    "You've started replacing meals. Several deeper directions are open to you — explore, compare, and choose what fits.",
  milestones: [
    { id: "clarify-why", label: "Clarify why vegetarian", status: "done" },
    { id: "basic-meals", label: "Learn basic meals", status: "done" },
    { id: "replace-meals", label: "Replace default meals", status: "done" },
    { id: "community", label: "Find community / support", status: "current" },
    { id: "social", label: "Handle restaurants / family / social situations", status: "next" },
    { id: "routine", label: "Build stable routine", status: "future" },
    { id: "deeper-path", label: "Decide deeper path", status: "future" },
  ],
  markersReached: 3,
  markersTotal: 7,
  defaultBranchId: "cooking-skill-route",
  branches: [
    {
      id: "health-route",
      title: "Health Route",
      icon: Activity,
      fit: "Worth exploring",
      whyItFits: "A fit if what's pulling you toward this is energy, longevity, or how you feel day to day.",
      nodes: [
        { id: "n1", label: "Learn nutrition basics" },
        { id: "n2", label: "Track energy & habits" },
        { id: "n3", label: "Build a sustainable plate" },
      ],
      factors: {
        typicalTime: "1 – 3 months",
        education: "Self-directed, or a nutrition-focused class",
        costFriction: "$",
        incomePotential: "Not applicable",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Very Low",
        demand: "High",
      },
      tradeoffs: [
        "Easy to over-focus on rules instead of what actually works for you",
        "Nutrition advice online is inconsistent — verify with a real source",
      ],
      nextStep: {
        title: "Track how you feel for one week",
        description: "Notice energy and mood changes before making bigger changes.",
      },
    },
    {
      id: "cooking-skill-route",
      title: "Cooking Skill Route",
      icon: ChefHat,
      fit: "High match",
      whyItFits: "The most concrete path — build the actual skill so the habit doesn't depend on willpower.",
      nodes: [
        { id: "n1", label: "Learn 5 staple meals" },
        { id: "n2", label: "Try a plant-based class" },
        { id: "n3", label: "Build a weekly rotation" },
      ],
      factors: {
        typicalTime: "1 – 2 months",
        education: "None required — classes are optional",
        costFriction: "$",
        incomePotential: "Not applicable",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Very Low",
        demand: "High",
      },
      tradeoffs: [
        "Takes real repetition before meals feel automatic",
        "Some staples require a bit of upfront grocery investment",
      ],
      nextStep: {
        title: "Attend one beginner-friendly plant-based cooking class",
        description: "Try the change in a real setting, guided and hands-on.",
      },
    },
    {
      id: "community-route",
      title: "Community Route",
      icon: Users,
      fit: "Worth exploring",
      whyItFits: "A fit if you stick with change better when you're not doing it alone.",
      nodes: [
        { id: "n1", label: "Find a local group" },
        { id: "n2", label: "Attend one meetup" },
        { id: "n3", label: "Build a support circle" },
      ],
      factors: {
        typicalTime: "2 – 4 weeks",
        education: "None required",
        costFriction: "Free – $",
        incomePotential: "Not applicable",
        autonomy: "Medium",
        emotionalIntensity: "Low",
        aiRisk: "Very Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Group quality varies a lot — try more than one",
        "Can feel exposed the first time you show up new",
      ],
      nextStep: {
        title: "Join one beginner vegetarian meetup",
        description: "Be around people already living this, so it feels normal, not novel.",
      },
    },
    {
      id: "ethical-activism-route",
      title: "Ethical / Activism Route",
      icon: Megaphone,
      fit: "Consider",
      whyItFits: "A fit if the pull is more about values and animal welfare than food itself.",
      nodes: [
        { id: "n1", label: "Learn the \"why\"" },
        { id: "n2", label: "Connect with local advocacy" },
        { id: "n3", label: "Find your voice" },
      ],
      factors: {
        typicalTime: "Ongoing",
        education: "Self-directed reading and conversation",
        costFriction: "Free",
        incomePotential: "Not applicable",
        autonomy: "High",
        emotionalIntensity: "Medium",
        aiRisk: "Very Low",
        demand: "Low",
      },
      tradeoffs: [
        "Can feel isolating if people around you don't share the values",
        "Easy to burn out on activism without a support base first",
      ],
      nextStep: {
        title: "Have one honest conversation",
        description: "Talk with someone already involved in local advocacy before diving in.",
      },
    },
    {
      id: "food-business-route",
      title: "Food Business Route",
      icon: Store,
      fit: "Broader stretch",
      whyItFits: "A stretch path — only worth it once cooking already feels easy and you want to build something.",
      nodes: [
        { id: "n1", label: "Test a recipe / product" },
        { id: "n2", label: "Get community feedback" },
        { id: "n3", label: "Explore selling it" },
      ],
      factors: {
        typicalTime: "3 – 6 months",
        education: "None required — local food-handling rules vary",
        costFriction: "$$",
        incomePotential: "$$",
        autonomy: "High",
        emotionalIntensity: "Medium",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Food business licensing varies a lot by city/state",
        "Turning a hobby into a business changes the relationship to it",
      ],
      nextStep: {
        title: "Get feedback on one dish",
        description: "Share it with people outside your household before thinking bigger.",
      },
    },
    {
      id: "low-friction-habit-route",
      title: "Low-Friction Habit Route",
      icon: Zap,
      fit: "Worth exploring",
      whyItFits: "A fit if you want the smallest possible version of this change to start with.",
      nodes: [
        { id: "n1", label: "Swap one meal a day" },
        { id: "n2", label: "Stock easy staples" },
        { id: "n3", label: "Make it automatic" },
      ],
      factors: {
        typicalTime: "2 – 3 weeks",
        education: "None required",
        costFriction: "Free – $",
        incomePotential: "Not applicable",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Very Low",
        demand: "High",
      },
      tradeoffs: [
        "Slower path to a fully vegetarian diet, if that's the actual goal",
        "Easy to plateau at \"one meal\" without a plan to build further",
      ],
      nextStep: {
        title: "Pick your easiest meal to swap first",
        description: "Usually breakfast or lunch — start there before dinner.",
      },
    },
  ],
  notes: [
    {
      id: "note-1",
      branchId: "cooking-skill-route",
      author: "Priya",
      role: "Vegetarian, 3 years",
      body: "Learn 5 meals you actually like before you try to go fully vegetarian. Variety comes later.",
      likes: 52,
      verified: true,
    },
    {
      id: "note-2",
      branchId: "community-route",
      author: "Sam",
      role: "Local meetup organizer",
      body: "Better first step: volunteer once before committing to a whole group. See if the vibe fits.",
      likes: 24,
    },
    {
      id: "note-3",
      branchId: "low-friction-habit-route",
      author: "Alex",
      role: "Vegetarian, 8 months",
      body: "Hidden friction: family dinners were harder than cooking for myself. Plan for those conversations early.",
      likes: 31,
    },
  ],
  notesTotal: 64,
};

const resaleBusinessGoal: TrailMapGoal = {
  id: "resale",
  label: "Build a resale business",
  pathTitle: "Resale Business",
  subtitle:
    "You've made your first sale. Several sourcing and channel paths are open to you — explore, compare, and choose what fits.",
  milestones: [
    { id: "explore", label: "Explore resale as an idea", status: "done" },
    { id: "sourcing", label: "Learn how sourcing works", status: "done" },
    { id: "first-sale", label: "Make your first sale", status: "done" },
    { id: "repeatable", label: "Find a repeatable sourcing method", status: "current" },
    { id: "channel", label: "Choose a resale channel", status: "next" },
    { id: "systems", label: "Build basic systems", status: "future" },
    { id: "niche", label: "Decide your niche", status: "future" },
    { id: "grow", label: "Grow into a real small business", status: "future" },
  ],
  markersReached: 3,
  markersTotal: 8,
  defaultBranchId: "ebay-resale",
  branches: [
    {
      id: "flea-market-sourcing",
      title: "Flea Market Sourcing",
      icon: ShoppingBag,
      fit: "Worth exploring",
      whyItFits: "The lowest-cost way to learn what resells before you commit to a channel or niche.",
      nodes: [
        { id: "n1", label: "Visit local flea markets" },
        { id: "n2", label: "Learn what resells" },
        { id: "n3", label: "Make your first flip" },
      ],
      factors: {
        typicalTime: "2 – 4 weeks to first flip",
        education: "None required",
        costFriction: "$",
        incomePotential: "$",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Time-intensive — good finds take repeat visits",
        "Margins are thin until you learn what actually resells",
      ],
      nextStep: {
        title: "Visit one flea market this weekend",
        description: "Go to browse and price-check, not necessarily to buy yet.",
      },
    },
    {
      id: "ebay-resale",
      title: "eBay Resale",
      icon: Package,
      fit: "High match",
      whyItFits: "The most direct path from a first sale to a repeatable, trackable resale business.",
      nodes: [
        { id: "n1", label: "List your first item" },
        { id: "n2", label: "Learn shipping & fees" },
        { id: "n3", label: "Build repeat sourcing" },
      ],
      factors: {
        typicalTime: "1 – 2 months to a repeatable rhythm",
        education: "None required",
        costFriction: "$",
        incomePotential: "$$",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Low",
        demand: "High",
      },
      tradeoffs: [
        "Platform fees and shipping eat into thin margins",
        "Customer disputes are part of the job",
      ],
      nextStep: {
        title: "List one item you already own",
        description: "Learn the full listing-to-shipping loop before sourcing more inventory.",
      },
    },
    {
      id: "vintage-clothing",
      title: "Vintage Clothing",
      icon: Shirt,
      fit: "Worth exploring",
      whyItFits: "A fit if you already have an eye for quality fabric, brands, or era-specific pieces.",
      nodes: [
        { id: "n1", label: "Learn to spot quality pieces" },
        { id: "n2", label: "Source from thrift / estate sales" },
        { id: "n3", label: "Build a small inventory" },
      ],
      factors: {
        typicalTime: "1 – 3 months",
        education: "Self-taught, or learn from an experienced reseller",
        costFriction: "$$",
        incomePotential: "$$",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Requires real knowledge to avoid overpaying for sourcing",
        "Storage becomes a real constraint as inventory grows",
      ],
      nextStep: {
        title: "Learn 3 brands or eras well",
        description: "Depth on a few categories beats broad, shallow knowledge early on.",
      },
    },
    {
      id: "estate-sales",
      title: "Estate Sales",
      icon: Home,
      fit: "Consider",
      whyItFits: "Higher-value finds than flea markets, but requires more patience and relationship-building.",
      nodes: [
        { id: "n1", label: "Attend local estate sales" },
        { id: "n2", label: "Learn appraisal basics" },
        { id: "n3", label: "Build buyer relationships" },
      ],
      factors: {
        typicalTime: "2 – 4 months",
        education: "None required — appraisal knowledge helps",
        costFriction: "$$",
        incomePotential: "$$$",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Best sales are competitive — early arrival matters",
        "Higher upfront cost per item than flea markets or thrift",
      ],
      nextStep: {
        title: "Attend one estate sale to observe",
        description: "Watch how experienced buyers move before spending real money.",
      },
    },
    {
      id: "repair-refurbish",
      title: "Repair / Refurbish",
      icon: Wrench,
      fit: "Consider",
      whyItFits: "A fit if you already have or want to build a hands-on repair skill that adds real value.",
      nodes: [
        { id: "n1", label: "Learn a repair skill" },
        { id: "n2", label: "Source broken / damaged items" },
        { id: "n3", label: "Sell refurbished pieces" },
      ],
      factors: {
        typicalTime: "1 – 3 months to first repair-and-flip",
        education: "Skill-dependent — tutorials or a local class",
        costFriction: "$$",
        incomePotential: "$$$",
        autonomy: "High",
        emotionalIntensity: "Low",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Highest skill floor of these paths — takes real practice",
        "Parts and tools are an upfront cost before your first sale",
      ],
      nextStep: {
        title: "Fix one broken item you already own",
        description: "Build the skill on something low-stakes before buying inventory to repair.",
      },
    },
    {
      id: "vendor-markets",
      title: "Vendor Markets",
      icon: Store,
      fit: "Broader stretch",
      whyItFits: "A stretch path — worth it once you have a real product line and want face-to-face selling.",
      nodes: [
        { id: "n1", label: "Apply for a vendor table" },
        { id: "n2", label: "Build a simple product line" },
        { id: "n3", label: "Sell at your first market" },
      ],
      factors: {
        typicalTime: "1 – 2 months to first market",
        education: "None required",
        costFriction: "$$",
        incomePotential: "$$",
        autonomy: "Medium",
        emotionalIntensity: "Medium",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Table fees mean a market day can be break-even or a loss",
        "Requires enough consistent inventory to be worth the table",
      ],
      nextStep: {
        title: "Apply for one vendor market",
        description: "Local markets are the lowest-cost way to test face-to-face selling.",
      },
    },
    {
      id: "supplier-relationships",
      title: "Supplier Relationships",
      icon: Handshake,
      fit: "Broader stretch",
      whyItFits: "The furthest-out path here — real leverage once you're sourcing at real volume.",
      nodes: [
        { id: "n1", label: "Research wholesale suppliers" },
        { id: "n2", label: "Build a small buyer network" },
        { id: "n3", label: "Negotiate your first deal" },
      ],
      factors: {
        typicalTime: "3 – 6 months",
        education: "None required — trade experience helps a lot",
        costFriction: "$$$",
        incomePotential: "$$$",
        autonomy: "High",
        emotionalIntensity: "Medium",
        aiRisk: "Low",
        demand: "Medium",
      },
      tradeoffs: [
        "Suppliers usually want proof of volume before serious terms",
        "Minimum order sizes can be a real cash-flow risk early on",
      ],
      nextStep: {
        title: "Reach out to one supplier",
        description: "Ask about minimums and terms before you're ready to buy — just to learn the landscape.",
      },
    },
  ],
  notes: [
    {
      id: "note-1",
      branchId: "ebay-resale",
      author: "Theo",
      role: "eBay reseller, 2 years",
      body: "Better first step: list something you already own before buying inventory. Learn the fees first.",
      likes: 38,
      verified: true,
    },
    {
      id: "note-2",
      branchId: "flea-market-sourcing",
      author: "Nina",
      role: "Flea market flipper",
      body: "This opened doors for me — met two other sellers who taught me what actually resells locally.",
      likes: 22,
    },
    {
      id: "note-3",
      branchId: "supplier-relationships",
      author: "Marcus",
      role: "Small import reseller",
      body: "Hidden friction: minimum order sizes. Ask suppliers directly before you assume you can afford in.",
      likes: 17,
    },
  ],
  notesTotal: 41,
};

export const trailMapGoals: TrailMapGoal[] = [therapistGoal, vegetarianGoal, resaleBusinessGoal];

export function getTrailMapGoal(id: TrailMapGoalId): TrailMapGoal {
  return trailMapGoals.find((g) => g.id === id) ?? trailMapGoals[0];
}
