import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { PathSidebar } from "@/components/route/PathSidebar";
import { RoutePlanningBody } from "@/components/route/RoutePlanningBody";
import { TopoLines } from "@/components/TopoLines";

export default function RoutePlanningPage() {
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

      <main className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-6 px-6 py-6 sm:px-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <PathSidebar />
        <RoutePlanningBody />
      </main>
    </div>
  );
}
