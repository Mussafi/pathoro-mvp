import Image from "next/image";
import { Leaf, Share2, ShieldCheck } from "lucide-react";

const badges = [
  {
    icon: Leaf,
    title: "One landscape",
    body: "All opportunities connected.",
  },
  {
    icon: Share2,
    title: "Real paths",
    body: "Grounded in people, places, and practice.",
  },
  {
    icon: ShieldCheck,
    title: "Your pace",
    body: "Reroute anytime. Progress stays.",
  },
];

export function PageHeader() {
  return (
    <header className="flex flex-nowrap items-center justify-between gap-5 px-6 py-4 sm:px-10">
      <Image
        src="/images/logo-full.png"
        alt="Pathoro — Find your way."
        width={1378}
        height={324}
        priority
        className="h-[46px] w-auto shrink-0"
      />

      <p className="max-w-[300px] shrink text-[13px] leading-snug text-ink-soft">
        The living landscape that helps you discover, plan, and take real
        steps toward what&rsquo;s next.
      </p>

      <div className="flex shrink-0 gap-2">
        {badges.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="shadow-card flex w-[158px] items-start gap-2 rounded-xl border border-line/70 bg-cream-card px-3 py-2"
          >
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-green"
              strokeWidth={1.75}
            />
            <span className="leading-tight">
              <span className="block text-[11.5px] font-semibold text-ink">
                {title}
              </span>
              <span className="block text-[10.5px] text-ink-faint">
                {body}
              </span>
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}
