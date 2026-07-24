"use client";

import { useState } from "react";
import { RouteExplorer } from "@/components/route/RouteExplorer";
import { OpportunitiesFromRoute } from "@/components/route/OpportunitiesFromRoute";
import { PostOpportunityCard } from "@/components/route/PostOpportunityCard";
import { RouteFooterBar } from "@/components/route/RouteFooterBar";
import { mapReachableToRouteId } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

export function RoutePlanningBody() {
  const { answers } = useDirectionAnswers();
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const selectedId = overrideId ?? mapReachableToRouteId(answers.reachable);

  return (
    <div className="flex min-w-0 flex-col">
      <RouteExplorer selectedId={selectedId} onSelect={setOverrideId} />
      <OpportunitiesFromRoute routeId={selectedId} />
      <PostOpportunityCard />
      <RouteFooterBar />
    </div>
  );
}
