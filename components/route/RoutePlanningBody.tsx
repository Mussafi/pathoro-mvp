"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { RouteRevealMap } from "@/components/route/RouteRevealMap";
import { BestNextRouteCard } from "@/components/route/BestNextRouteCard";
import { ExploreOtherRoutes } from "@/components/route/ExploreOtherRoutes";
import { ScoutRequestCard } from "@/components/route/ScoutRequestCard";
import { PostOpportunityCard } from "@/components/route/PostOpportunityCard";
import { RouteFooterBar } from "@/components/route/RouteFooterBar";
import { mapReachableToRouteId } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";
import { useLiveOpportunities } from "@/lib/useLiveOpportunities";

export function RoutePlanningBody() {
  const { answers } = useDirectionAnswers();
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const mappedRouteId = mapReachableToRouteId(answers.reachable);
  const selectedId = overrideId ?? mappedRouteId;
  const live = useLiveOpportunities();
  const city = answers.location.toLowerCase().trim();
  const hasLiveDbMatch = live.some(
    (o) => o.routeId === selectedId && o.city.toLowerCase().trim() === city
  );

  function handleExploreOthers() {
    setExploreOpen(true);
    document
      .getElementById("explore-other-routes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-start gap-2.5 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
        <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
        <p className="text-[11.5px] leading-relaxed text-ink-soft">
          Pathoro is not an event search engine. It looks for real-world
          access points — people, places, resources, and openings — that
          could help you move along your path.
        </p>
      </div>
      <div className="mt-4">
        <RouteRevealMap
          selectedRouteId={selectedId}
          suggestedRouteId={mappedRouteId}
          onSelectRoute={setOverrideId}
          location={answers.location}
          answers={answers}
        />
      </div>
      <BestNextRouteCard
        selectedRouteId={selectedId}
        suggestedRouteId={mappedRouteId}
        answers={answers}
        onExploreOthers={handleExploreOthers}
      />
      {!hasLiveDbMatch && (
        <ScoutRequestCard
          routeId={selectedId}
          pathGoal={answers.moveToward}
          city={answers.location}
          userContext={`Making room for: ${answers.makeRoomFor}. Starting from: ${answers.startingFrom}.`}
        />
      )}
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
