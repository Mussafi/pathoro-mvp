"use client";

import { useState } from "react";
import Image from "next/image";

export function ReferenceOverlay({
  referenceSrc = "/images/reference-full.png",
}: {
  referenceSrc?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-40 flex justify-center overflow-auto">
          <Image
            src={referenceSrc}
            alt="Approved reference design overlay"
            width={1491}
            height={1055}
            className="h-auto w-full max-w-[1500px] opacity-40"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="fixed bottom-4 left-20 z-50 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-medium text-cream shadow-lg"
      >
        {show ? "Hide reference" : "Show reference"}
      </button>
    </>
  );
}
