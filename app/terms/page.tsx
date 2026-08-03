import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms">
      <p>
        This is a plain-language alpha disclaimer, not a formal legal
        document. By using Pathoro during this public alpha, you understand
        the following:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Pathoro provides orientation and source-backed suggestions — not
          professional, legal, medical, or financial advice. Always verify
          official requirements (licensing, certification, admissions,
          legal, medical, or financial) from official sources before
          relying on them.
        </li>
        <li>
          Community trail markers are moderated before they appear
          publicly, but their accuracy is not guaranteed. They reflect one
          person&rsquo;s experience, not a verified fact.
        </li>
        <li>
          AI-found opportunities may be incomplete, outdated, or no longer
          available. Pathoro finding a source is not Pathoro vouching for
          it — review it yourself before acting.
        </li>
        <li>
          &ldquo;Take this opportunity&rdquo; saves a next-step request that
          Pathoro reviews manually. It does not sign you up, apply on your
          behalf, or contact an outside organization for you.
        </li>
        <li>
          This is an early alpha. Features may change, break, or be removed
          without notice, and Pathoro is provided as-is with no uptime or
          accuracy guarantees.
        </li>
      </ul>
      <p>
        Questions about any of this? Use{" "}
        <a href="/contact" className="font-medium text-green underline">Contact</a>.
      </p>
    </LegalPageLayout>
  );
}
