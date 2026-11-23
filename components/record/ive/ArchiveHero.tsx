"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

// 2026-11-24 in Korea was day 1811; the count goes up at midnight KST.
const ANCHOR_DAY = 1811;
const KST_OFFSET_MS = 9 * 3_600_000;
const ANCHOR_KST_MIDNIGHT = Date.UTC(2026, 10, 24) - KST_OFFSET_MS;
const DAY_MS = 86_400_000;

function dayCount(now: number) {
  return ANCHOR_DAY + Math.floor((now - ANCHOR_KST_MIDNIGHT) / DAY_MS);
}

/** Days count that ticks over at 00:00 KST, even while the page stays open. */
function useKstDays() {
  // Computed after mount so the server's clock can't cause a hydration mismatch.
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = Date.now();
      setDays(dayCount(now));
      const msToMidnight = DAY_MS - ((now - ANCHOR_KST_MIDNIGHT) % DAY_MS);
      timer = setTimeout(tick, msToMidnight + 1000);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return days;
}

/** Wide cover banner: title top-left, day count bottom-right, "IVE" signed bottom-left. */
export function ArchiveHero({
  coverUrl,
  position,
}: {
  coverUrl?: string | null;
  position?: { x: number; y: number };
}) {
  const days = useKstDays();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-10 mb-14 aspect-[16/9] overflow-hidden rounded-3xl ring-1 ring-[var(--glass-border)] sm:aspect-[21/9] md:mt-16"
      style={{
        background:
          "linear-gradient(140deg,var(--dream-pink),var(--dream-lilac) 55%,var(--dream-blue))",
      }}
    >
      {coverUrl && (
        <Image src={coverUrl} alt="" fill priority sizes="(min-width: 1152px) 1120px, 100vw"
          className="object-cover"
          style={{ objectPosition: `${position?.x ?? 50}% ${position?.y ?? 50}%` }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04),rgba(0,0,0,0.38))]" />

      <h1 className="absolute left-5 top-4 font-display text-3xl italic leading-none text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl md:left-8 md:top-7 md:text-6xl">
        DIVE into IVE
      </h1>
      <p className="absolute bottom-4 right-5 font-display text-2xl italic leading-none text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-4xl md:bottom-6 md:right-8 md:text-5xl">
        <span className="tabular-nums">{days ?? "    "}</span> days
      </p>
      <span className="absolute bottom-4 left-5 font-mono text-xs tracking-[0.35em] text-white/85 md:bottom-6 md:left-8 md:text-sm">
        IVE
      </span>
    </motion.div>
  );
}
