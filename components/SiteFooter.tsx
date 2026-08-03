import Link from "next/link";
import { FeedbackButton } from "@/components/FeedbackModal";

/** Shared public-page footer (v0.43 "Public Alpha Release Readiness") — one
 * quiet, elegant place for the alpha disclosure, a feedback path, and the
 * basic legal pages a stranger might look for. Not shown on /admin, which
 * already carries its own "internal prototype" banner. */
export function SiteFooter() {
  return (
    <footer className="relative mx-auto mt-10 w-full max-w-[1500px] border-t border-line/70 px-6 py-6 sm:px-10">
      <p className="max-w-[640px] text-[11.5px] leading-relaxed text-ink-faint">
        Pathoro is in public alpha. It helps you map possible next steps,
        source-backed access points, and trail notes. Review sources before
        acting.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-ink-faint">
        <Link href="/about" className="outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50">
          About
        </Link>
        <Link href="/privacy" className="outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50">
          Privacy
        </Link>
        <Link href="/terms" className="outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50">
          Terms
        </Link>
        <Link href="/contact" className="outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50">
          Contact
        </Link>
        <FeedbackButton className="font-medium text-green outline-none transition hover:underline focus-visible:ring-2 focus-visible:ring-green/50" />
      </div>
    </footer>
  );
}
