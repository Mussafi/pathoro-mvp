import Image from "next/image";
import { Compass, Footprints, Mountain, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Footprints,
    title: "Physically reachable",
    body: "Every step happens in the real world.",
  },
  {
    icon: TrendingUp,
    title: "Action > motivation",
    body: "Small steps build forward momentum.",
  },
  {
    icon: Compass,
    title: "You're in control",
    body: "Choose the route that fits your life right now.",
  },
  {
    icon: Mountain,
    title: "One landscape",
    body: "All routes connect to help you move forward.",
  },
];

export function RouteFooterBar() {
  return (
    <div className="shadow-card relative mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-line/70 bg-cream-card py-5 pl-6 pr-10">
      <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-4">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex max-w-[178px] items-start gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-soft">
              <Icon className="h-3.5 w-3.5 text-green" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-ink">
                {title}
              </span>
              <span className="block text-[10.5px] leading-snug text-ink-faint">
                {body}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="h-7 w-7 shrink-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(127,162,58,0.4) 0%, rgba(127,162,58,0) 70%)",
          }}
        />
        <span className="h-2 w-2 shrink-0 rounded-full bg-green shadow-[0_0_10px_3px_rgba(127,162,58,0.6)]" />
        <div className="shrink-0 text-right">
          <div className="relative ml-auto h-3 w-[95px]">
            <Image
              src="/images/logo-wordmark.png"
              alt="Pathoro"
              fill
              sizes="95px"
              className="object-contain object-right"
            />
          </div>
          <p className="mt-1 whitespace-nowrap text-[12px] leading-tight text-ink-soft">
            One landscape.
            <br />
            Infinite ways.
          </p>
        </div>
      </div>
    </div>
  );
}
