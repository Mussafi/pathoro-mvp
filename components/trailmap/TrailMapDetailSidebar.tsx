import {
  ArrowRight,
  Brain,
  Clock,
  Compass,
  DollarSign,
  GraduationCap,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";
import { isFavorableRating, type RatingLevel, type TrailMapBranch } from "@/lib/trailMapData";

const FIT_BADGE_CLASS: Record<TrailMapBranch["fit"], string> = {
  "High match": "border-green/40 bg-green-soft text-green",
  "Worth exploring": "border-line/70 bg-cream-field text-ink-soft",
  Consider: "border-line/70 bg-cream-field text-ink-faint",
  "Broader stretch": "border-line/70 bg-cream-field text-ink-faint",
};

function ratingClass(kind: "aiRisk" | "demand", value: RatingLevel) {
  return isFavorableRating(kind, value) ? "text-green font-semibold" : "text-ink-soft";
}

export function TrailMapDetailSidebar({ branch }: { branch: TrailMapBranch }) {
  const { factors } = branch;

  return (
    <div className="flex flex-col gap-4">
      <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-serif text-[18px] leading-tight text-ink">{branch.title}</span>
        </div>
        <span
          className={`mt-2 w-fit rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${FIT_BADGE_CLASS[branch.fit]}`}
        >
          {branch.fit}
        </span>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">{branch.whyItFits}</p>

        <div className="mt-4 flex flex-col gap-2.5 border-t border-line/70 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            <Info className="h-3 w-3" strokeWidth={2} />
            Journey profile
          </span>
          <ProfileRow icon={Clock} label="Typical time" value={factors.typicalTime} />
          <ProfileRow icon={GraduationCap} label="Education" value={factors.education} />
          <ProfileRow icon={DollarSign} label="Cost / friction" value={factors.costFriction} />
          <ProfileRow icon={TrendingUp} label="Income potential" value={factors.incomePotential} />
          <ProfileRow icon={Compass} label="Autonomy" value={factors.autonomy} />
          <ProfileRow icon={Brain} label="Emotional intensity" value={factors.emotionalIntensity} />
          <ProfileRow
            icon={Info}
            label="AI risk"
            value={factors.aiRisk}
            valueClassName={ratingClass("aiRisk", factors.aiRisk)}
          />
          <ProfileRow
            icon={Users}
            label="Demand"
            value={factors.demand}
            valueClassName={ratingClass("demand", factors.demand)}
          />
        </div>

        <p className="mt-4 rounded-xl border border-line/70 bg-cream-field px-3 py-2.5 text-[10.5px] leading-relaxed text-ink-faint">
          Requirements vary by state. Pathoro should verify licensing details
          from official state sources before treating this as guidance.
        </p>

        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Common tradeoffs
          </span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {branch.tradeoffs.map((tradeoff) => (
              <li key={tradeoff} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Next step
          </span>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-between gap-2 rounded-2xl border border-green/40 bg-green-soft/60 px-3.5 py-3 text-left transition hover:bg-green-soft"
          >
            <span>
              <span className="block text-[12.5px] font-semibold text-ink">
                {branch.nextStep.title}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                {branch.nextStep.description}
              </span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-cream">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[12px]">
      <span className="flex items-center gap-1.5 text-ink-faint">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {label}
      </span>
      <span className={`text-right ${valueClassName ?? "text-ink"}`}>{value}</span>
    </div>
  );
}
