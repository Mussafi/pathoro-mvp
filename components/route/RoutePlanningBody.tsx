"use client";

import { useState } from "react";
import { RouteRevealMap } from "@/components/route/RouteRevealMap";
import { RouteExplorer } from "@/components/route/RouteExplorer";
import { OpportunitiesFromRoute } from "@/components/route/OpportunitiesFromRoute";
import { PostOpportunityCard } from "@/components/route/PostOpportunityCard";
import { RouteFooterBar } from "@/components/route/RouteFooterBar";
import { mapReachableToRouteId } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

export function RoutePlanningBody() {
  const { answers } = useDirectionAnswers();
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const mappedRouteId = mapReachableToRouteId(answers.reachable);
  const selectedId = overrideId ?? mappedRouteId;

  return (
    <div className="flex min-w-0 flex-col">
      <RouteRevealMap
        selectedRouteId={selectedId}
        suggestedRouteId={mappedRouteId}
        onSelectRoute={setOverrideId}
        location={answers.location}
        answers={answers}
      />
      <div id="route-rows" className="mt-6 scroll-mt-6">
        <RouteExplorer selectedId={selectedId} onSelect={setOverrideId} />
      </div>
      <OpportunitiesFromRoute routeId={selectedId} />
      <PostOpportunityCard />
      <RouteFooterBar />
    </div>
  );
}
