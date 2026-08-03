import Link from "next/link";
import Image from "next/image";
import { TopoLines } from "@/components/TopoLines";
import { SiteFooter } from "@/components/SiteFooter";

/** Shared shell for the simple alpha-version public pages (About, Privacy,
 * Terms, Contact) — one place to keep the plain-language framing
 * consistent instead of four near-duplicate layouts. */
export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <TopoLines
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        count={20}
        opacityRange={[0.015, 0.035]}
      />
      <div className="relative border-b border-line/70 px-6 py-4 sm:px-10">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/images/logo-full.png"
            alt="Pathoro — Find your way."
            width={1378}
            height={324}
            className="h-[36px] w-auto"
          />
        </Link>
      </div>

      <main className="relative mx-auto w-full max-w-[680px] px-6 py-10 sm:px-10">
        <Link
          href="/"
          className="text-[12.5px] font-medium text-ink-soft outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
        >
          ← Back to Pathoro
        </Link>
        <h1 className="mt-3 font-serif text-[28px] leading-tight text-ink">{title}</h1>
        <div className="mt-4 flex flex-col gap-4 text-[13.5px] leading-relaxed text-ink-soft">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
