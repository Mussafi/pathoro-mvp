import { ArrowRight, Lock } from "lucide-react";
import Image from "next/image";

export function WelcomeCard() {
  return (
    <div className="flex flex-col">
      <div className="shadow-card relative flex flex-col overflow-hidden rounded-[26px] border border-line/70 bg-cream-card">
        <div className="relative z-10 shrink-0 px-5 pt-5">
          <div
            className="relative w-[140px]"
            style={{ aspectRatio: "1378 / 154" }}
          >
            <Image
              src="/images/logo-wordmark.png"
              alt="Pathoro"
              fill
              sizes="140px"
              className="object-contain object-left"
            />
          </div>

          <h1 className="mt-3.5 font-serif text-[21px] leading-[1.2] text-ink">
            A living landscape
            <br />
            of opportunity.
          </h1>
          <p className="mt-1.5 font-serif italic text-[15px] text-green">
            Find your way.
          </p>
          <p className="mt-2 max-w-[260px] text-[12.5px] leading-relaxed text-ink-soft">
            Pathoro helps you discover what&rsquo;s next, map a path that fits
            your life, and take steps that move you forward.
          </p>

          <a
            href="#orientation"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-green px-4 py-2 text-[12.5px] font-medium text-cream shadow-sm transition hover:bg-green-dark"
          >
            Begin Your Journey
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            I already have an account
          </p>
        </div>

        {/* approved photographic artwork — locked to its source aspect ratio */}
        <div
          className="relative mt-4 w-full overflow-hidden"
          style={{ aspectRatio: "334 / 421" }}
        >
          <Image
            src="/images/welcome-photo.jpg"
            alt="A hiker standing above a glowing winding path through misty mountains"
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,18,10,0) 0%, rgba(20,18,10,0.18) 100%)",
            }}
          />

          {/* phone mockup — small, elegant product preview */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 w-[40%] max-w-[135px] -translate-x-1/2">
            <div className="rounded-[18px] border-[4px] border-[#14130d] bg-[#1b1a12] p-2 shadow-2xl">
              <div className="mb-1 flex items-center justify-between text-[6px] text-[#f2ecd6]/80">
                <span>9:41</span>
                <span>●●●</span>
              </div>
              <span className="text-[6.5px] font-semibold tracking-[0.18em] text-[#f2ecd6]">
                PATHORO
              </span>
              <p className="mt-1.5 font-serif text-[9.5px] leading-tight text-[#f7f2e2]">
                Find your way.
                <br />
                One landscape.
                <br />
                Infinite possibilities.
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green px-1.5 py-1 text-[6.5px] font-medium text-cream">
                Begin Your Journey
                <ArrowRight className="h-1.5 w-1.5" />
              </div>
              <p className="mt-0.5 text-[6px] text-[#f2ecd6]/60">
                I already have an account
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 flex shrink-0 items-center justify-center gap-1.5 text-center text-[11.5px] text-ink-faint">
        <Lock className="h-3 w-3" />
        This is private and only visible to you.
      </p>
    </div>
  );
}
