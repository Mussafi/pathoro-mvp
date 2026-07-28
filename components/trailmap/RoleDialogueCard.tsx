import { MessageCircle } from "lucide-react";

/** Static concept preview only — see docs/JOB-DIALOGUE-CONCEPT.md. No
 * backend, no working CTA. This is earlier-stage than the Path Guide
 * card (which is a functional alpha feature); Role Dialogue is a
 * documented future direction made visible in-product, not a shipped
 * feature — hence "Concept" rather than "Alpha", and a disabled CTA. */
type TrustLabel = "Verified live" | "Recently checked" | "Employer-posted" | "Community-confirmed" | "Stale risk" | "Possible ghost listing" | "Source unclear";

const TRUST_LABEL_CLASS: Record<TrustLabel, string> = {
  "Verified live": "border-green/40 bg-green/10 text-green",
  "Recently checked": "border-green/40 bg-green/10 text-green",
  "Employer-posted": "border-line/70 bg-cream-field text-ink-soft",
  "Community-confirmed": "border-line/70 bg-cream-field text-ink-soft",
  "Stale risk": "border-amber-400/40 bg-amber-400/10 text-amber-700",
  "Possible ghost listing": "border-red-400/40 bg-red-400/10 text-red-700",
  "Source unclear": "border-amber-400/40 bg-amber-400/10 text-amber-700",
};

const TRUST_LABELS: TrustLabel[] = [
  "Verified live",
  "Recently checked",
  "Employer-posted",
  "Community-confirmed",
  "Stale risk",
  "Possible ghost listing",
  "Source unclear",
];

const DIALOGUE_PROMPTS = [
  "Is this role real or stale?",
  "What does this role open next?",
  "What hidden requirements matter?",
  "What would make me competitive?",
  "Who should I talk to before applying?",
  "What is the first move from where I am?",
];

/** What a real Role Dialogue would let someone do — shown as inert
 * chips, not buttons, since none of this is wired up yet. */
const DIALOGUE_ACTIONS = [
  "Start dialogue",
  "Check if this is real",
  "Ask what this role opens",
  "Find someone in this path",
  "Map how to become competitive",
];

export function RoleDialogueCard() {
  return (
    <div className="shadow-card relative flex flex-col overflow-hidden rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-field">
          <MessageCircle className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
        </span>
        <span className="text-[14px] font-semibold text-ink">Role dialogue</span>
        <span className="ml-auto shrink-0 rounded-full border border-line/70 bg-cream-field px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-faint">
          Concept
        </span>
      </div>

      <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-soft">
        Instead of showing you another job listing, Pathoro helps you
        understand whether this role is real, reachable, and useful for
        your path.
      </p>

      <ul className="mt-3.5 flex flex-col gap-1.5">
        {DIALOGUE_PROMPTS.map((prompt) => (
          <li key={prompt} className="text-[11.5px] leading-snug text-ink-soft before:mr-1.5 before:text-ink-faint before:content-['·']">
            {prompt}
          </li>
        ))}
      </ul>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {TRUST_LABELS.map((label) => (
          <span
            key={label}
            className={`rounded-full border px-2 py-0.5 text-[9.5px] font-medium ${TRUST_LABEL_CLASS[label]}`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {DIALOGUE_ACTIONS.map((action) => (
          <span
            key={action}
            className="cursor-not-allowed rounded-full border border-line/70 bg-cream-field px-2.5 py-1 text-[10.5px] font-medium text-ink-faint opacity-70"
          >
            {action}
          </span>
        ))}
        <span className="rounded-full bg-cream-card px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-faint">
          Coming soon
        </span>
      </div>

      <p className="mt-3 text-[10px] leading-snug text-ink-faint">
        A concept preview, not a live feature yet. Pathoro is not a job
        board — a listing becomes useful only when it&rsquo;s placed in a
        path.
      </p>
    </div>
  );
}
