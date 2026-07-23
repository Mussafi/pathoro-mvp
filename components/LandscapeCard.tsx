import type { CSSProperties } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Filter,
  Heart,
  Lightbulb,
  MapPin,
  SlidersHorizontal,
  Sprout,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";

type NodeCard = {
  id: string;
  eyebrow: string;
  icon: typeof Users;
  title: string;
  body: string;
  tone: "olive" | "green";
  style: CSSProperties;
};

const nodes: NodeCard[] = [
  {
    id: "growth",
    eyebrow: "GROWTH",
    icon: Users,
    title: "Leadership & Management",
    body: "Opportunities to lead and scale",
    tone: "olive",
    style: { top: "-24px", left: "56.3%", width: "24.2%", height: "24%" },
  },
  {
    id: "wellbeing",
    eyebrow: "WELL-BEING",
    icon: Heart,
    title: "Health & Lifestyle",
    body: "Build habits that create energy",
    tone: "green",
    style: { top: "26.2%", left: "71.5%", width: "24.2%", height: "21%" },
  },
  {
    id: "community",
    eyebrow: "COMMUNITY",
    icon: UsersRound,
    title: "People & Belonging",
    body: "Find your people and grow together",
    tone: "olive",
    style: { top: "21.7%", left: "4.5%", width: "28.9%", height: "21%" },
  },
  {
    id: "career",
    eyebrow: "CAREER CHANGE",
    icon: Compass,
    title: "New Direction",
    body: "Explore fields and start fresh",
    tone: "green",
    style: { top: "63.5%", left: "5.5%", width: "28.9%", height: "21%" },
  },
  {
    id: "creativity",
    eyebrow: "CREATIVITY",
    icon: Lightbulb,
    title: "Projects & Ideas",
    body: "Bring ideas to life and build",
    tone: "olive",
    style: { top: "63.5%", left: "66.3%", width: "28.4%", height: "21%" },
  },
];

const recentMoves = [
  { icon: Sprout, label: "Explored", title: "Health & Lifestyle", time: "2 days ago" },
  { icon: TrendingUp, label: "Saved", title: "Leadership Roles", time: "5 days ago" },
  { icon: Users, label: "Joined", title: "Austin Runners", time: "1 week ago" },
];

export function LandscapeCard() {
  return (
    <div className="shadow-card flex flex-col overflow-hidden rounded-[26px] border border-line/70 bg-cream-card">
      {/* top badge area — stacked above the map, never covered by it */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-badge px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-cream">
          YOU ARE HERE
        </span>
        <div className="flex gap-2">
          <button className="shadow-card flex h-8 w-8 items-center justify-center rounded-full border border-line/70 bg-cream-card">
            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-soft" />
          </button>
          <button className="shadow-card flex h-8 w-8 items-center justify-center rounded-full border border-line/70 bg-cream-card">
            <Filter className="h-3.5 w-3.5 text-ink-soft" />
          </button>
        </div>
      </div>

      {/* user context box */}
      <div className="relative z-20 px-5 pt-4">
        <div className="flex items-start gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-soft">
            <MapPin className="h-4 w-4 text-green" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold text-ink">
              Alex
            </span>
            <span className="block text-[12.5px] text-ink-faint">
              Open to opportunities
            </span>
            <span className="block text-[12.5px] text-ink-faint">
              Austin, TX
            </span>
          </span>
          <button className="flex items-center gap-1 self-center text-[12.5px] font-medium text-ink-soft">
            Update context <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* then the map — approved artwork with floating region cards */}
      <div className="relative z-0 mx-5 mt-10 w-full overflow-visible" style={{ aspectRatio: "691 / 515" }}>
        <div className="absolute inset-0 overflow-hidden rounded-[20px]">
          <Image
            src="/images/landscape-photo.jpg"
            alt="A misty topographic mountain landscape with glowing paths radiating from a central node"
            fill
            sizes="(min-width: 1024px) 700px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className="shadow-float absolute overflow-hidden rounded-2xl border border-line/60 bg-cream-card px-3.5 py-3"
              style={node.style}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    node.tone === "green" ? "bg-green-soft" : "bg-[#f1e9d6]"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      node.tone === "green" ? "text-green" : "text-[#8a6d3b]"
                    }`}
                    strokeWidth={1.75}
                  />
                </span>
                <span>
                  <span className="block text-[10px] font-semibold tracking-wide text-ink-faint">
                    {node.eyebrow}
                  </span>
                  <span className="block font-serif text-[13.5px] leading-tight text-ink">
                    {node.title}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-ink-soft">
                {node.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative z-20 mt-6 flex items-center justify-between px-5 pb-2">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          RECENT MOVES
        </span>
        <button className="text-[12px] font-medium text-ink-soft">
          View all
        </button>
      </div>
      <div className="relative z-20 flex flex-wrap gap-5 border-t border-line/70 bg-cream-card px-5 py-4">
        {recentMoves.map((move) => {
          const Icon = move.icon;
          return (
            <div key={move.title} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-soft">
                <Icon className="h-3.5 w-3.5 text-green" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-[11px] text-ink-faint">
                  {move.label}
                </span>
                <span className="block text-[12.5px] font-medium text-ink">
                  {move.title}
                </span>
                <span className="block text-[10.5px] text-ink-faint">
                  {move.time}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
