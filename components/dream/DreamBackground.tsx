"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Deterministic PRNG so server and client render identical star fields. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20251113);
const STARS = Array.from({ length: 46 }, (_, i) => ({
  id: i,
  top: rand() * 100,
  left: rand() * 100,
  size: 2 + rand() * 3,
  dur: 3 + rand() * 5,
  delay: rand() * 6,
  glyph: rand() > 0.82,
}));

const ORBS = [
  { color: "var(--dream-pink)", size: "46vmax", top: "-12%", left: "-10%", dur: "38s" },
  { color: "var(--dream-blue)", size: "40vmax", top: "30%", left: "60%", dur: "46s" },
  { color: "var(--dream-lilac)", size: "38vmax", top: "65%", left: "-8%", dur: "52s" },
  { color: "var(--dream-mint)", size: "26vmax", top: "8%", left: "70%", dur: "34s" },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")";

export function DreamBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Drifting pastel orbs */}
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-drift opacity-50 dark:opacity-30 blur-[90px]"
          style={
            {
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
              "--drift-dur": o.dur,
              animationDelay: `${-i * 7}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Twinkling stars */}
      {STARS.map((s) =>
        s.glyph ? (
          <span
            key={s.id}
            className="absolute animate-twinkle text-[var(--glow)] select-none"
            style={
              {
                top: `${s.top}%`,
                left: `${s.left}%`,
                fontSize: `${s.size * 3.5}px`,
                "--tw-dur": `${s.dur}s`,
                "--tw-delay": `${s.delay}s`,
              } as React.CSSProperties
            }
          >
            ✦
          </span>
        ) : (
          <span
            key={s.id}
            className="absolute rounded-full animate-twinkle bg-[var(--dream-lilac)] dark:bg-white"
            style={
              {
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                boxShadow: "0 0 8px 2px var(--dream-pink)",
                "--tw-dur": `${s.dur}s`,
                "--tw-delay": `${s.delay}s`,
              } as React.CSSProperties
            }
          />
        ),
      )}

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.09] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
      />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklch,var(--background)_70%,transparent))]" />

      <CursorGlow />
    </div>
  );
}

/** A soft halo that lazily trails the pointer (fine pointers only). */
function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="absolute size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 dark:opacity-25 blur-3xl"
      style={{
        left: sx,
        top: sy,
        background:
          "radial-gradient(circle, var(--dream-pink), var(--dream-lilac) 40%, transparent 70%)",
      }}
    />
  );
}
