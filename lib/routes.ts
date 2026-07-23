import {
  ClipboardList,
  Leaf,
  CalendarCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type RouteStep = {
  label: string;
};

export type Route = {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  steps: [RouteStep, RouteStep, RouteStep];
  tone: "sage" | "peach";
  description: string;
  why: string;
  nextStepTitle: string;
  nextStepBody: string;
};

export const routes: Route[] = [
  {
    id: "people",
    icon: Users,
    title: "People Route",
    summary: "Learn from someone living this habit.",
    steps: [
      { label: "Find one person living this habit" },
      { label: "Ask how they made it realistic" },
      { label: "Get one practical tip" },
    ],
    tone: "sage",
    description:
      "Someone already living this habit can show you what actually works, not just what sounds good in theory.",
    why: "Hearing how someone else made this real cuts through theory and shows you what actually works day to day.",
    nextStepTitle: "Find one person living this habit",
    nextStepBody:
      "Look for someone in your network, a local group, or online who already lives this and would be open to a quick conversation.",
  },
  {
    id: "requirements",
    icon: ClipboardList,
    title: "Requirements Route",
    summary: "Remove friction & prepare.",
    steps: [
      { label: "Name the friction points" },
      { label: "Map the supplies or setup" },
      { label: "Choose one environment change" },
    ],
    tone: "peach",
    description:
      "Clearing the practical obstacles first makes the habit easier to start and far easier to keep.",
    why: "Most habits fail on logistics, not willpower. Clearing the setup first makes the habit easier to start and easier to keep.",
    nextStepTitle: "Name the friction points",
    nextStepBody:
      "Write down what makes this hard right now — time, tools, space, or knowledge — so you know exactly what to remove first.",
  },
  {
    id: "real-openings",
    icon: CalendarCheck,
    title: "Real Openings Route",
    summary: "Step into real-world openings.",
    steps: [
      { label: "Find a class or public commitment" },
      { label: "Join a workshop or event" },
      { label: "Schedule the first real-world step" },
    ],
    tone: "sage",
    description:
      "Physical openings create momentum and make change stick in the real world.",
    why: "Real openings create accountability, reduce friction, and help you take your first step in the real world.",
    nextStepTitle: "Find a class or public commitment",
    nextStepBody:
      "Look for a class, workshop, or public challenge that aligns with your goal.",
  },
  {
    id: "community",
    icon: UsersRound,
    title: "Community Route",
    summary: "Find your people & stay connected.",
    steps: [
      { label: "Join a group doing it" },
      { label: "Attend a local event" },
      { label: "Stay connected" },
    ],
    tone: "peach",
    description:
      "Doing this alongside other people makes the habit feel normal instead of like a novelty.",
    why: "Change sticks when it's shared. A community keeps you accountable and makes the habit feel normal, not novel.",
    nextStepTitle: "Join a group doing it",
    nextStepBody:
      "Search for a local or online community already built around this habit and introduce yourself.",
  },
  {
    id: "try-it",
    icon: Leaf,
    title: "Try It Route",
    summary: "Test before you commit.",
    steps: [
      { label: "Try one real-world cue" },
      { label: "Do a one-day version" },
      { label: "Reflect on the fit" },
    ],
    tone: "sage",
    description:
      "A small, low-stakes trial tells you fast whether this habit actually fits your life.",
    why: "A low-stakes trial tells you fast whether this habit fits your life, before you invest real time or identity in it.",
    nextStepTitle: "Try one real-world cue",
    nextStepBody:
      "Pick the smallest possible version of this habit and try it once this week, no commitment attached.",
  },
];

export const defaultRouteId = "real-openings";

export const opportunityContext = {
  stepLabel: "3 of 7 steps",
  title: "Change a habit / lifestyle",
  goalLabel: "Making room for",
  goal: "Better health / longevity.",
  description:
    "This path helps you build the kind of life that supports your energy, focus, and future self.",
  makesRoomFor: "Better health / longevity",
  makesRoomForDetail: "More energy, lower risk, longer life.",
};
