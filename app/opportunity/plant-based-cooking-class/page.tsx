import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { ProgressRail } from "@/components/opportunity/ProgressRail";
import { OpportunityMain } from "@/components/opportunity/OpportunityMain";
import { GuidancePanel } from "@/components/opportunity/GuidancePanel";
import { StatusBar } from "@/components/opportunity/StatusBar";
import { TopoLines } from "@/components/TopoLines";

export default function OpportunityDetailPage() {
  return (
    <div className="relative min-h-screen">
      <TopoLines
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        count={20}
        opacityRange={[0.015, 0.035]}
      />
      <div className="relative border-b border-line/70">
        <RoutePlanningHeader />
      </div>

      <main className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-6 px-6 py-6 sm:px-10 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <ProgressRail />
        <OpportunityMain />
        <GuidancePanel />
      </main>

      <div className="mx-auto w-full max-w-[1500px] px-6 pb-8 sm:px-10">
        <StatusBar />
      </div>
    </div>
  );
}
