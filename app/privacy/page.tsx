import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy">
      <p>
        This is a plain-language alpha privacy notice, not a formal legal
        document. Pathoro is a small, early-stage product — here is what it
        actually does with your information today.
      </p>
      <p>
        <span className="font-semibold text-ink">What Pathoro stores.</span>{" "}
        Your goal, location, and a few onboarding answers are kept in your
        browser (not sent anywhere) so the app remembers your place. If you
        submit a trail marker, a &ldquo;take this opportunity&rdquo; request,
        a Path Guide request, a scout request, or feedback, Pathoro saves
        what you typed — including an email address only if you chose to
        provide one — so a real person can review or follow up on it.
      </p>
      <p>
        <span className="font-semibold text-ink">Who can see it.</span>{" "}
        Submitted content is reviewed by Pathoro before anything public
        appears (for example, a trail marker only becomes visible after
        approval). Contact emails are never shown publicly and are only
        used to follow up on what you submitted.
      </p>
      <p>
        <span className="font-semibold text-ink">Third parties.</span>{" "}
        Pathoro stores data with Supabase and, when scouting for
        opportunities, searches the public web through a third-party search
        API (Tavily). Pathoro does not sell your information.
      </p>
      <p>
        <span className="font-semibold text-ink">Your choices.</span> Don&rsquo;t
        include anything you don&rsquo;t want stored. If you want something
        you submitted removed, use{" "}
        <a href="/contact" className="font-medium text-green underline">Contact</a> and Pathoro will
        handle it manually — there&rsquo;s no self-serve account or
        deletion tool yet in this alpha.
      </p>
    </LegalPageLayout>
  );
}
