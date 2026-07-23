import { Compass, Footprints, Heart, MapPin, Route, type LucideIcon } from "lucide-react";

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
};

export const directionQuestions: DirectionQuestion[] = [
  {
    key: "moveToward",
    question: "What are you trying to move toward?",
    mapsTo: "Direction",
    icon: Compass,
  },
  {
    key: "makeRoomFor",
    question: "What should this make room for?",
    mapsTo: "Meaning / fuel",
    icon: Heart,
  },
  {
    key: "startingFrom",
    question: "Where are you starting from?",
    mapsTo: "Current location",
    icon: MapPin,
  },
  {
    key: "reachable",
    question: "What would make this feel more reachable?",
    mapsTo: "Route type / support need",
    icon: Route,
  },
  {
    key: "tryFirst",
    question: "What could you try first?",
    mapsTo: "First movement",
    icon: Footprints,
  },
];

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
