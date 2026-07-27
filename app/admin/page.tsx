import Link from "next/link";
import {
  ClipboardList,
  Compass,
  Flag,
  Inbox,
  Map,
  Route as RouteIcon,
  Search,
  Signpost,
  type LucideIcon,
} from "lucide-react";

type HubLink = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const links: HubLink[] = [
  {
    href: "/admin/opportunity-scout",
    icon: Search,
    title: "Opportunity Scout",
    description:
      "Search the web for route-relevant, hidden-opportunity, and gateway-community candidates.",
  },
  {
    href: "/admin/scout-requests",
    icon: Compass,
    title: "Scout Requests",
    description: "See what real users asked Pathoro to go look for.",
  },
  {
    href: "/admin/discovery-queue",
    icon: Inbox,
    title: "Discovery Queue",
    description: "Log leads on where a real-world opportunity might be found.",
  },
  {
    href: "/admin/opportunity-ingestion",
    icon: ClipboardList,
    title: "Opportunity Ingestion",
    description: "Review and approve opportunity drafts before they go live.",
  },
  {
    href: "/admin/trail-markers",
    icon: Flag,
    title: "Trail Marker Review",
    description: "Approve or reject signs left by people who've walked a path.",
  },
  {
    href: "/admin/path-guide-requests",
    icon: Signpost,
    title: "Path Guide Requests",
    description: "See who's asking for a path guide, and manually match them with someone ahead.",
  },
  {
    href: "/route-planning",
    icon: RouteIcon,
    title: "Route Planning",
    description: "See the public product — what a user sees once they arrive.",
  },
  {
    href: "/trail-map",
    icon: Map,
    title: "Advanced Trail Map",
    description: "Prototype: a more detailed journey map for concentrated goals (e.g. become a therapist).",
  },
];

export default function AdminHubPage() {
  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          Internal prototype — not linked publicly. This is where Pathoro
          gets operated: finding, reviewing, and approving real-world
          opportunities and trail markers before anything reaches a user.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Admin hub
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Everything needed to operate Pathoro&rsquo;s opportunity pipeline.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="shadow-card flex items-center gap-3.5 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4 transition hover:border-green/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-soft">
                  <Icon className="h-4.5 w-4.5 text-green" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-ink">
                    {link.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">
                    {link.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
