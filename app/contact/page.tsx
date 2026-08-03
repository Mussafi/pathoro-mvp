import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact">
      <p>
        Pathoro is built by a small team during public alpha. This form goes
        straight to the person building it — tell us what helped, what
        confused you, what was wrong, or what you wish existed.
      </p>
      <div className="shadow-card mt-2 rounded-[26px] border border-line/70 bg-cream-card p-5">
        <FeedbackForm />
      </div>
    </LegalPageLayout>
  );
}
