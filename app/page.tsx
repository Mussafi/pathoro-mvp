import { PageHeader } from "@/components/PageHeader";
import { StepperNav } from "@/components/StepperNav";
import { WelcomeCard } from "@/components/WelcomeCard";
import { OrientationCard } from "@/components/OrientationCard";
import { LandscapeCard } from "@/components/LandscapeCard";
import { TopoLines } from "@/components/TopoLines";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <TopoLines
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        count={20}
        opacityRange={[0.015, 0.035]}
      />
      <div className="relative border-b border-line/70">
        <PageHeader />
      </div>
      <div className="relative border-b border-line/70">
        <StepperNav />
      </div>

      <main className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-6 px-6 py-6 sm:px-10 lg:grid-cols-[320px_320px_1fr]">
        <WelcomeCard />
        <OrientationCard />
        <LandscapeCard />
      </main>
    </div>
  );
}
