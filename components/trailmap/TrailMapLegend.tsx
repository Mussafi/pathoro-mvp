import { Circle, Hand, Lock, Mountain, MousePointerClick } from "lucide-react";

const items = [
  { icon: Circle, title: "You are here", detail: "Current position", iconClassName: "text-green fill-green" },
  { icon: Circle, title: "Available path", detail: "Open to explore", iconClassName: "text-ink-faint" },
  { icon: Lock, title: "Locked path", detail: "Requirements to unlock" },
  { icon: Mountain, title: "Trail marker", detail: "Note from someone ahead" },
  { icon: Hand, title: "Path glow", detail: "Selected path" },
  { icon: MousePointerClick, title: "Click to explore", detail: "Dive deeper into this path" },
];

export function TrailMapLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line/70 bg-cream-field px-5 py-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        How to read the map
      </span>
      {items.map((item) => (
        <span key={item.title} className="flex items-center gap-1.5">
          <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.iconClassName ?? "text-ink-faint"}`} strokeWidth={1.75} />
          <span className="text-[11px] leading-tight text-ink-soft">
            {item.title}
            <span className="text-ink-faint"> · {item.detail}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
