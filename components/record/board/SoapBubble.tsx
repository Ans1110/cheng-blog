"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Cheap deterministic pseudo-random so a bubble keeps the same look between renders. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Same thin-film colours on every bubble, so they read as one material. */
const FILM =
  "conic-gradient(from 0deg, rgba(255,170,220,0.9), rgba(140,220,255,0.9), rgba(255,230,160,0.9), rgba(190,170,255,0.9), rgba(140,220,255,0.9), rgba(255,170,220,0.9))";
// `closest-side` = 100% is the circle's edge (plain `circle` reaches the box corner, ~141%).
const RIM_MASK = "radial-gradient(circle closest-side, transparent 70%, black 92%, black 97%, transparent 100%)";

/**
 * Soap-bubble look, layered behind the content: a clear body,
 * a faint iridescent film at the rim, a soft top-left highlight and a few trapped specks.
 */
export function SoapBubble({ seed }: { seed: number }) {
  const reduceMotion = useReducedMotion();
  const sparkles = Array.from({ length: 6 }, (_, i) => {
    const a = rand(seed + i) * Math.PI * 2;
    const r = 18 + Math.sqrt(rand(seed + i + 50)) * 22; // keep away from the text in the middle
    return {
      left: 50 + Math.cos(a) * r,
      top: 50 + Math.sin(a) * r,
      size: 1 + rand(seed + i + 100) * 1.5,
      opacity: 0.25 + rand(seed + i + 150) * 0.35,
    };
  });

  return (
    <span
      aria-hidden
      className="soap-bubble pointer-events-none absolute inset-0 rounded-full"
      style={{ boxShadow: "var(--sb-shadow)" }}
    >
      {/* Clear body: barely there in the middle, a touch brighter at the edge */}
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--sb-body)" }}
      />

      {/* Iridescent film at the rim, slowly drifting */}
      <motion.span
        className="sb-film absolute inset-0 rounded-full"
        style={{ background: FILM, WebkitMask: RIM_MASK, mask: RIM_MASK }}
        initial={{ rotate: rand(seed) * 360 }}
        animate={reduceMotion ? undefined : { rotate: rand(seed) * 360 + 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Faint sky reflection low in the bubble */}
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--sb-sky)" }}
      />

      {/* Soft highlight near the top-left edge (kept off-centre and dim) */}
      <span
        className="absolute rounded-full blur-[5px] transition-all duration-700 ease-out group-hover:translate-x-[12%] group-hover:translate-y-[6%] group-hover:opacity-100 opacity-80"
        style={{
          left: "14%",
          top: "8%",
          width: "30%",
          height: "14%",
          transform: "rotate(-35deg)",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.42), rgba(255,255,255,0) 70%)",
        }}
      />

      {/* A few trapped specks */}
      {sparkles.map((sp, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${sp.left}%`,
            top: `${sp.top}%`,
            width: sp.size,
            height: sp.size,
            opacity: sp.opacity,
            background: "var(--sb-speck)",
          }}
        />
      ))}

      {/* Hover: faint light around the bubble */}
      <span
        className="absolute -inset-3 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "var(--sb-glow)" }}
      />

      {/* Thin glassy edge: a soft gradient ring, so the outline isn't a hard 1px line */}
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--sb-rim)" }}
      />
    </span>
  );
}
