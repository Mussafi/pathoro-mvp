import Link from "next/link";
import { Route as RouteIcon } from "lucide-react";
import type { Opportunity } from "@/lib/opportunitySchema";

function getDisplayTags(opportunity: Opportunity): string[] {
  const tags: string[] = [];
  if (opportunity.frictionLevel === "Low") {
    tags.push("Beginner-friendly");
  }
  if (opportunity.effortLevel === "Low") {
    tags.push("Low effort");
  }
  if (opportunity.effortLevel === "Low" && opportunity.frictionLevel === "Low") {
    tags.push("Good first step");
  }
  return tags;
}

export function OpportunityTile({
  opportunity,
  location,
}: {
  opportunity: Opportunity;
  location: string;
}) {
  const isClickable = Boolean(opportunity.href);
  const tags = getDisplayTags(opportunity);
  const className =
    "flex flex-col rounded-2xl border border-l-[3px] border-line/70 border-l-green/50 bg-cream-field px-3.5 py-3.5 text-left transition" +
    (isClickable ? " hover:border-green/40 hover:border-l-green hover:bg-cream-card" : "");

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="block text-[13px] font-semibold text-ink">
          {opportunity.title}
        </span>
        {isClickable ? (
          <span className="shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold text-green">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
            Preview
          </span>
        )}
      </div>
      <span className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold text-green">
        <RouteIcon className="h-2.5 w-2.5" strokeWidth={2} />
        From your selected route
      </span>
      <span className="mt-1 block text-[11px] font-medium text-ink-faint">
        {opportunity.opportunityType}
      </span>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
        {opportunity.description}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint">
          Near {location}
        </span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-ink-faint/80">
        Preview data · Mock seed · Real ingestion coming soon
      </p>
    </>
  );

  if (isClickable) {
    return (
      <Link href={opportunity.href!} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
