import { Compass, Footprints, Heart, MapPin, Route, type LucideIcon } from "lucide-react";
import { defaultRouteId } from "@/lib/routes";

export type DirectionAnswers = {
  moveToward: string;
  makeRoomFor: string;
  startingFrom: string;
  reachable: string;
  tryFirst: string;
};

export const defaultDirectionAnswers: DirectionAnswers = {
  moveToward: "Become vegetarian",
  makeRoomFor: "Better health / longevity",
  startingFrom: "I eat meat most days and don't know what to cook",
  reachable: "A class, group, or real local opening",
  tryFirst: "Attend one beginner-friendly plant-based cooking class",
};

export type DirectionQuestion = {
  key: keyof DirectionAnswers;
  question: string;
  mapsTo: string;
  icon: LucideIcon;
  options: string[];
};

export const directionQuestions: DirectionQuestion[] = [
  {
    key: "moveToward",
    question: "What are you trying to move toward?",
    mapsTo: "Direction",
    icon: Compass,
    options: [
      "A healthier lifestyle",
      "A new career direction",
      "More community",
      "A creative project",
      "More confidence",
      "Better routines",
      "A skill I want to build",
      "Something I can’t name yet",
    ],
  },
  {
    key: "makeRoomFor",
    question: "What should this make room for?",
    mapsTo: "Meaning / fuel",
    icon: Heart,
    options: [
      "More energy",
      "Belonging",
      "Freedom",
      "Stability",
      "Money",
      "Confidence",
      "Meaning",
      "Creativity",
      "Better health",
      "A different kind of life",
    ],
  },
  {
    key: "startingFrom",
    question: "Where are you starting from?",
    mapsTo: "Current location",
    icon: MapPin,
    options: [
      "I’m curious but unsure",
      "I’ve tried before and stopped",
      "I don’t know where to begin",
      "I need people around me",
      "I need structure",
      "I need a real opportunity",
      "I’m already moving but want a clearer path",
    ],
  },
  {
    key: "reachable",
    question: "What would make this feel more reachable?",
    mapsTo: "Route type / support need",
    icon: Route,
    options: [
      "Someone who has done it before",
      "A class, event, or opening",
      "A group or community",
      "A breakdown of requirements",
      "A small low-pressure trial",
      "I’m not sure — suggest one",
    ],
  },
  {
    key: "tryFirst",
    question: "What could you try first?",
    mapsTo: "First movement",
    icon: Footprints,
    options: [
      "Talk to one person",
      "Find one class or event",
      "Join one group",
      "Try one small version",
      "Map what I need",
      "Save an opportunity for later",
      "Let Pathoro suggest a first step",
    ],
  },
];

const reachableToRouteId: Record<string, string> = {
  "Someone who has done it before": "people",
  "A class, event, or opening": "real-openings",
  "A group or community": "community",
  "A breakdown of requirements": "requirements",
  "A small low-pressure trial": "try-it",
  "I’m not sure — suggest one": "real-openings",
};

export function mapReachableToRouteId(reachable: string): string {
  return reachableToRouteId[reachable] ?? defaultRouteId;
}

const STORAGE_KEY = "pathoro:direction-answers";

export function loadDirectionAnswers(): DirectionAnswers {
  if (typeof window === "undefined") return defaultDirectionAnswers;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDirectionAnswers;
    const parsed = JSON.parse(raw) as Partial<DirectionAnswers>;
    return { ...defaultDirectionAnswers, ...parsed };
  } catch {
    return defaultDirectionAnswers;
  }
}

export function saveDirectionAnswers(answers: DirectionAnswers) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}
