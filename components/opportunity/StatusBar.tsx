import Image from "next/image";
import { Bookmark, Circle, MapPin, Mountain } from "lucide-react";
import { statusBar } from "@/lib/opportunity";

const icons = {
  here: MapPin,
  paths: Circle,
  saved: Bookmark,
  marker: Mountain,
};

export function StatusBar() {
  return (
    <div className="shadow-card mt-6 flex flex-wrap items-center justify-between gap-6 rounded-[26px] border border-line/70 bg-cream-card px-6 py-4">
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {statusBar.map((item) => {
          const Icon = icons[item.id as keyof typeof icons];
          const isHere = item.id === "here";
          return (
            <div key={item.id} className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isHere ? "bg-green-soft" : "border border-line/70"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isHere ? "fill-green text-green" : "text-ink-faint"}`}
                  strokeWidth={1.75}
                />
              </span>
              <span>
                <span className="block text-[12.5px] font-semibold text-ink">
                  {item.title}
                </span>
                <span className="block text-[11px] text-ink-faint">{item.body}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line/70">
          <Image
            src="/images/user-avatar.jpg"
            alt="Your Health & Lifestyle Coach"
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <span>
          <span className="block text-[12.5px] font-semibold text-ink">Need support?</span>
          <span className="block text-[11px] text-ink-faint">
            Talk to your Health &amp; Lifestyle Coach
          </span>
        </span>
      </div>
    </div>
  );
}
