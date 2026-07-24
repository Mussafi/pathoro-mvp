"use client";

import { useState } from "react";
import { RouteRevealMap } from "@/components/route/RouteRevealMap";
import { BestNextRouteCard } from "@/components/route/BestNextRouteCard";
import { ExploreOtherRoutes } from "@/components/route/ExploreOtherRoutes";
import { PostOpportunityCard } from "@/components/route/PostOpportunityCard";
import { RouteFooterBar } from "@/components/route/RouteFooterBar";
import { mapReachableToRouteId } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

export function RoutePlanningBody() {
  const { answers } = useDirectionAnswers();
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const mappedRouteId = mapReachableToRouteId(answers.reachable);
  const selectedId = overrideId ?? mappedRouteId;

  function handleExploreOthers() {
    setExploreOpen(true);
    document
      .getElementById("explore-other-routes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex min-w-0 flex-col">
      <RouteRevealMap
        selectedRouteId={selectedId}
        suggestedRouteId={mappedRouteId}
        onSelectRoute={setOverrideId}
        location={answers.location}
        answers={answers}
      />
      <BestNextRouteCard
        selectedRouteId={selectedId}
        suggestedRouteId={mappedRouteId}
        answers={answers}
        onExploreOthers={handleExploreOthers}
      />
      <ExploreOtherRoutes
        selectedId={selectedId}
        onSelect={setOverrideId}
        expanded={exploreOpen}
        onToggle={() => setExploreOpen((v) => !v)}
      />
      <PostOpportunityCard />
      <RouteFooterBar />
    </div>
  );
}
