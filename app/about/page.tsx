import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export default function AboutPage() {
  return (
    <LegalPageLayout title="What is Pathoro?">
      <p>
        Pathoro helps you figure out a real next step toward something you
        want — a career, a habit, a business — and then helps you find an
        actual place to take that step: a class, an apprenticeship, an
        info session, a person who&rsquo;s already done it.
      </p>
      <p>
        It combines three things: a map of the path itself (what usually
        comes first, what branches exist, what a realistic timeline looks
        like), Pathoro&rsquo;s own scouting for source-backed access points
        on the open web, and trail notes — short signs left by people who
        walked the path before you, plus Pathoro&rsquo;s own starter notes
        where real community notes haven&rsquo;t accumulated yet.
      </p>
      <p>
        Pathoro is not a job board, not a course marketplace, and not a
        social feed. It doesn&rsquo;t sign you up for anything on your
        behalf, and it doesn&rsquo;t claim to have verified an opportunity
        just because it found it.
      </p>
      <p>
        Pathoro is currently in public alpha — a small, early release meant
        to be genuinely useful while it&rsquo;s still being built. See{" "}
        <a href="/terms" className="font-medium text-green underline">Terms</a> for what that means in
        practice, or use{" "}
        <a href="/contact" className="font-medium text-green underline">Contact</a> to tell us what felt
        useful or confusing.
      </p>
    </LegalPageLayout>
  );
}
