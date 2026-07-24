export type RouteOpportunity = {
  id: string;
  routeId: string;
  title: string;
  type: string;
  purpose: string;
  effortTags: string[];
  href?: string;
};

export const routeOpportunities: RouteOpportunity[] = [
  {
    id: "talk-with-someone",
    routeId: "people",
    title: "Talk with Someone Who Made the Shift",
    type: "Person / Conversation",
    purpose: "Learn what actually helped, not just what sounds good in theory.",
    effortTags: ["Beginner-friendly", "Low effort"],
  },
  {
    id: "beginner-setup-checklist",
    routeId: "requirements",
    title: "Beginner Setup Checklist",
    type: "Planning / Requirements",
    purpose: "Lower friction and know exactly what you need before you start.",
    effortTags: ["Good first step", "Low effort"],
  },
  {
    id: "plant-based-cooking-class",
    routeId: "real-openings",
    title: "Plant-Based Cooking Class",
    type: "Class / Event",
    purpose: "Try the change in a real setting, guided and hands-on.",
    effortTags: ["Beginner-friendly", "Good first step"],
    href: "/opportunity/plant-based-cooking-class",
  },
  {
    id: "beginner-vegetarian-meetup",
    routeId: "community",
    title: "Beginner Vegetarian Meetup",
    type: "Group / Community",
    purpose: "Be around people already living this, so it feels normal, not novel.",
    effortTags: ["Beginner-friendly", "Low effort"],
  },
  {
    id: "7-day-trial",
    routeId: "try-it",
    title: "7-Day Plant-Forward Trial",
    type: "Small Trial",
    purpose: "Test the path before committing, with no pressure attached.",
    effortTags: ["Good first step", "Low effort"],
  },
];

export function getOpportunitiesForRoute(routeId: string): RouteOpportunity[] {
  return routeOpportunities.filter((o) => o.routeId === routeId);
}
