"use client";

import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/** Seconds for one full lap around the halo. */
const LAP = 16;
/** Orbit radius as a share of the halo box (50 = the ring's edge). */
const RADIUS = 52;
/**
 * Angles are clockwise from 12 o'clock. The halo is split along the diagonal:
 * the butterfly owns the upper-left half (7:30 → 1:30, along the star trail),
 * the star the lower-right half on the orbit; they swap at the two diagonal
 * crossings with a short cross-fade and a sparkle.
 */
const SWAP_RIGHT = 45;
const SWAP_LEFT = 225;
const FADE = 14; // degrees either side of a swap point

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/** 0 → star fully shown, 1 → butterfly fully shown. */
const butterflyAmount = (deg: number) => {
  // Distance into the butterfly's half: rises around 270°, falls around 90°.
  if (deg >= SWAP_LEFT - FADE || deg <= SWAP_RIGHT - FADE) {
    if (deg >= SWAP_LEFT - FADE && deg <= SWAP_LEFT + FADE) {
      return smooth((deg - (SWAP_LEFT - FADE)) / (2 * FADE));
    }
    return 1;
  }
  if (deg <= SWAP_RIGHT + FADE) {
    return 1 - smooth((deg - (SWAP_RIGHT - FADE)) / (2 * FADE));
  }
  return 0;
};

/** How strong the swap sparkle is (peaks right at 3 and 9 o'clock). */
const sparkleAmount = (deg: number) => {
  const d = Math.min(Math.abs(deg - SWAP_RIGHT), Math.abs(deg - SWAP_LEFT));
  return d < FADE ? 1 - d / FADE : 0;
};

/**
 * Star trail over the upper-left half, in halo-box percent (square box, so units
 * are even): an asymmetrical arc that bulges a little outside the ring, set on
 * the diagonal from 7:30 to 1:30. Both ends sit on the orbit, so the hand-off to
 * the star's circular path is seamless.
 */
type Pt = readonly [number, number];
const TRAIL_START: Pt = [13.23, 86.77]; // orbit at 225°
const CURVES: readonly (readonly [Pt, Pt, Pt])[] = [
  [[-29.2, 50], [25.96, -33.44], [86.77, 13.23]], // ends on the orbit at 45°
];
const TRAIL_D = `M${TRAIL_START.join(" ")} ${CURVES.map((c) => `C${c.map((pt) => pt.join(" ")).join(" ")}`).join(" ")}`;
const bezier = (p0: Pt, [p1, p2, p3]: readonly [Pt, Pt, Pt], t: number): [number, number] => {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const pts = [p0, p1, p2, p3];
  return [0, 1].map((k) => pts.reduce((sum, pt, i) => sum + pt[k] * w[i], 0)) as [number, number];
};
/** The trail sampled into short segments, so the butterfly moves at an even speed. */
const TRAIL: [number, number][] = [[...TRAIL_START]];
CURVES.forEach((curve, ci) => {
  const p0 = ci === 0 ? TRAIL_START : CURVES[ci - 1][2];
  for (let i = 1; i <= 24; i++) TRAIL.push(bezier(p0, curve, i / 24));
});
const SEGMENTS = TRAIL.slice(1).map(([x1, y1], i) => {
  const [x0, y0] = TRAIL[i];
  return { x0, y0, dx: x1 - x0, dy: y1 - y0, len: Math.hypot(x1 - x0, y1 - y0) };
});
const TRAIL_LENGTH = SEGMENTS.reduce((sum, s) => sum + s.len, 0);

/** Position and heading (deg, 0 = facing right) at progress t along the trail. */
const trailAt = (t: number) => {
  let d = Math.min(1, Math.max(0, t)) * TRAIL_LENGTH;
  for (const s of SEGMENTS) {
    if (d <= s.len) {
      const k = d / s.len;
      return { x: s.x0 + s.dx * k, y: s.y0 + s.dy * k, heading: (Math.atan2(s.dy, s.dx) * 180) / Math.PI };
    }
    d -= s.len;
  }
  const last = SEGMENTS[SEGMENTS.length - 1];
  return { x: last.x0 + last.dx, y: last.y0 + last.dy, heading: (Math.atan2(last.dy, last.dx) * 180) / Math.PI };
};

/** Twinkle stars along the arc: progress along it, and size. */
const STARS = [
  { at: 0.16, size: 0.8 },
  { at: 0.38, size: 1.15 },
  { at: 0.55, size: 0.7 },
  { at: 0.82, size: 1 },
].map((star) => {
  const { x, y } = trailAt(star.at);
  // Pre-formatted so server and client render identical attributes.
  return { ...star, x: x.toFixed(2), y: y.toFixed(2) };
});

/** The butterfly starts at 9 o'clock, on the trail. */
const START_ANGLE = 270;
const START_POS = (() => {
  const { x, y } = trailAt(((START_ANGLE - SWAP_LEFT + 360) % 360) / 180);
  // Pre-formatted so server and client render identical styles.
  return { left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%` };
})();

/** Fine diffraction spikes: long vertical, shorter horizontal, tiny diagonals. */
const SPIKES = "M0 -4.2 L0.16 -0.16 L2.6 0 L0.16 0.16 L0 4.2 L-0.16 0.16 L-2.6 0 L-0.16 -0.16 Z";
const SPIKES_DIAG = "M1.2 -1.2 L0.12 0 L1.2 1.2 L0 0.12 L-1.2 1.2 L-0.12 0 L-1.2 -1.2 L0 -0.12 Z";

/**
 * Comet tail behind the butterfly: stacked dashes ending at its position.
 * Longer layers are thinner and fainter, so together they taper off.
 */
const TAIL = [
  { len: 0.03, width: 0.7, opacity: 0.9, glow: false },
  { len: 0.07, width: 0.45, opacity: 0.55, glow: false },
  { len: 0.13, width: 0.8, opacity: 0.18, glow: true },
  { len: 0.2, width: 0.22, opacity: 0.22, glow: false },
];
/** Stardust shed by the butterfly. */
const DUST = 18;
const DUST_EVERY = 55; // ms between specks
const DUST_LIFE = 1100; // ms

/** Five-point doodle star (slightly tilted) and the smaller star inside it. */
const OUTER_STAR =
  "M-3.6 -20.7 L4.2 -8.5 L18.5 -9.9 L9.4 1.3 L15.1 14.6 L1.6 9.4 L-9.2 18.9 L-8.4 4.5 L-20.8 -2.9 L-6.8 -6.6 Z";
const INNER_STAR =
  "M-3.1 -9.4 L1.2 -3.7 L8.3 -4.8 L4.2 1.1 L7.4 7.5 L0.6 5.5 L-4.5 10.5 L-4.7 3.3 L-11.1 0.1 L-4.3 -2.3 Z";

/** A butterfly that flies a star trail over the halo, turning into a star for the bottom. */
export function HaloOrbit() {
  const reduceMotion = useReducedMotion();
  const riderRef = useRef<HTMLDivElement>(null);
  const butterflyRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);
  const tailRefs = useRef<(SVGPathElement | null)[]>([]);
  const dustRefs = useRef<(SVGCircleElement | null)[]>([]);
  const dust = useRef(
    Array.from({ length: DUST }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, age: DUST_LIFE })),
  );
  const dustClock = useRef(0);
  const nextDust = useRef(0);
  const trailStarRefs = useRef<(SVGGElement | null)[]>([]);
  const heading = useRef<number | null>(null);
  const angle = useRef(START_ANGLE);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    angle.current = (angle.current + (360 / LAP) * (Math.min(delta, 50) / 1000)) % 360;
    const deg = angle.current;
    const rad = (deg * Math.PI) / 180;

    // Top half (9 → 3 o'clock) follows the star trail; bottom half the circle.
    const onTrail = deg >= SWAP_LEFT || deg <= SWAP_RIGHT;
    const t = onTrail ? ((deg - SWAP_LEFT + 360) % 360) / 180 : 1;
    const p = onTrail
      ? trailAt(t)
      : { x: 50 + RADIUS * Math.sin(rad), y: 50 - RADIUS * Math.cos(rad), heading: deg };

    const rider = riderRef.current;
    if (rider) {
      rider.style.left = `${p.x}%`;
      rider.style.top = `${p.y}%`;
    }

    // Ease the heading round the corners instead of snapping.
    if (heading.current === null) heading.current = p.heading;
    const turn = ((p.heading - heading.current + 540) % 360) - 180;
    heading.current += turn * Math.min(1, delta / 110);

    const b = butterflyAmount(deg);

    // Comet tail: each layer is a dash ending at the butterfly, fading with it.
    TAIL.forEach(({ len, opacity }, i) => {
      const el = tailRefs.current[i];
      if (!el) return;
      el.style.strokeDashoffset = String(len - t);
      el.style.opacity = String(onTrail ? opacity * b : 0);
    });

    // Stardust: shed specks along the trail that drift, shrink and fade out.
    dustClock.current += delta;
    if (onTrail && b > 0.4 && dustClock.current >= DUST_EVERY) {
      dustClock.current = 0;
      const d = dust.current[nextDust.current];
      nextDust.current = (nextDust.current + 1) % DUST;
      d.x = p.x + (Math.random() - 0.5) * 1.6;
      d.y = p.y + (Math.random() - 0.5) * 1.6;
      d.vx = (Math.random() - 0.5) * 0.002;
      d.vy = 0.002 + Math.random() * 0.003; // settles downward
      d.r = 0.14 + Math.random() * 0.26;
      d.age = 0;
    }
    dust.current.forEach((d, i) => {
      const el = dustRefs.current[i];
      if (!el) return;
      d.age += delta;
      const life = Math.max(0, 1 - d.age / DUST_LIFE);
      d.x += d.vx * delta;
      d.y += d.vy * delta;
      el.setAttribute("cx", d.x.toFixed(2));
      el.setAttribute("cy", d.y.toFixed(2));
      el.setAttribute("r", (d.r * (0.4 + 0.6 * life)).toFixed(3));
      el.style.opacity = String(life * life);
    });

    // Stars on the trail flare as the butterfly passes them.
    STARS.forEach(({ at }, i) => {
      const el = trailStarRefs.current[i];
      if (!el) return;
      const near = onTrail ? Math.max(0, 1 - Math.abs(t - at) / 0.06) : 0;
      el.style.transform = `scale(${1 + 0.8 * near})`;
    });

    if (butterflyRef.current) {
      // Heading follows the tangent of a clockwise orbit; a gentle bob keeps it alive.
      const bob = Math.sin(deg * 0.35) * 8;
      butterflyRef.current.style.opacity = String(b);
      butterflyRef.current.style.transform = `translate(-50%, -50%) rotate(${heading.current + bob}deg) scale(${0.4 + 0.6 * b})`;
    }
    if (starRef.current) {
      starRef.current.style.opacity = String(1 - b);
      starRef.current.style.transform = `translate(-50%, -50%) scale(${0.4 + 0.6 * (1 - b)})`;
    }
    if (sparkleRef.current) {
      const s = sparkleAmount(deg);
      sparkleRef.current.style.opacity = String(s);
      sparkleRef.current.style.transform = `translate(-50%, -50%) scale(${0.6 + s * 0.9}) rotate(${deg * 2}deg)`;
    }
  });

  const trail = (
    <svg viewBox="0 0 100 100" className="halo-trail absolute inset-0 size-full">
      <defs>
        <radialGradient id="trail-star-halo">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.22" stopColor="var(--orbit-glow)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--orbit-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Faint path the butterfly follows, like a constellation line */}
      <path d={TRAIL_D} fill="none" className="trail-base" />
      {!reduceMotion && (
        <>
          {TAIL.map(({ len, width, glow }, i) => (
            <path
              key={i}
              ref={(el) => {
                tailRefs.current[i] = el;
              }}
              d={TRAIL_D}
              pathLength={1}
              fill="none"
              className={glow ? "trail-tail trail-tail-glow" : "trail-tail"}
              strokeWidth={width}
              style={{ strokeDasharray: `${len} 2`, opacity: 0 }}
            />
          ))}
          {Array.from({ length: DUST }, (_, i) => (
            <circle
              key={i}
              ref={(el) => {
                dustRefs.current[i] = el;
              }}
              r="0"
              fill="#fff"
              className="trail-dust"
              style={{ opacity: 0 }}
            />
          ))}
        </>
      )}
      {STARS.map(({ x, y, size }, i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${size})`}>
          <g
            ref={(el) => {
              trailStarRefs.current[i] = el;
            }}
            className="trail-flare"
          >
            <circle r="2.6" fill="url(#trail-star-halo)" className="trail-star-halo" style={{ animationDelay: `${i * 0.7}s` }} />
            <g fill="#fff" className="trail-star" style={{ animationDelay: `${i * 0.7}s` }}>
              <path d={SPIKES} />
              <path d={SPIKES_DIAG} opacity="0.7" />
            </g>
            <circle r="0.42" fill="#fff" />
          </g>
        </g>
      ))}
    </svg>
  );

  if (reduceMotion) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {trail}
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {trail}
      <div ref={riderRef} className="absolute" style={{ left: START_POS.left, top: START_POS.top }}>
        {/* Crystal butterfly: faces "right" at rotate(0), i.e. along the top of a clockwise orbit */}
        <div ref={butterflyRef} className="absolute left-0 top-0 opacity-0">
          <svg
            viewBox="-24 -22 48 44"
            className="halo-butterfly size-12 md:size-16"
            style={{ transform: "rotate(90deg)" }}
          >
            <defs>
              <radialGradient id="crystal-fill" cx="0.5" cy="0.45" r="0.65">
                <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.5" stopColor="var(--orbit-ink)" stopOpacity="0.07" />
                <stop offset="0.85" stopColor="#fff" stopOpacity="0.04" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.28" />
              </radialGradient>
              <linearGradient id="crystal-amber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffd9a0" stopOpacity="0" />
                <stop offset="0.55" stopColor="#f2b56b" stopOpacity="0.28" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {[-1, 1].map((side) => (
              <g key={side} className="halo-wing" transform={`scale(${side} 1)`}>
                {/* Upper wing: angular, like cut glass */}
                <path
                  d="M-1 -1 L-4 -9 L-9 -17 L-14 -20 L-19 -16.5 L-21.5 -9 L-18.5 -2.5 L-10 0 Z"
                  fill="url(#crystal-fill)"
                  className="crystal-edge"
                />
                <path
                  d="M-2 -2 L-13 -16 M-3.5 -4 L-19.5 -12 M-6 -1.5 L-18 -5 M-9 -10 L-15 -8 L-10.5 -3 M-13 -16 L-15 -8 L-19.5 -12 M-9 -17 L-9 -10 M-4 -9 L-9 -10 M-21.5 -9 L-15 -8 M-18.5 -2.5 L-15 -8"
                  fill="none" className="crystal-facet"
                />
                {/* Lower wing with a warm reflection */}
                <path
                  d="M-1 1 L-8 2 L-15 5 L-17.5 10.5 L-13.5 16 L-6.5 15 L-2.5 8.5 Z"
                  fill="url(#crystal-fill)"
                  className="crystal-edge"
                />
                <path d="M-1 1 L-8 2 L-15 5 L-17.5 10.5 L-13.5 16 L-6.5 15 L-2.5 8.5 Z" fill="url(#crystal-amber)" />
                <path d="M-2 2 L-14 11 M-3 4 L-8 15 M-8 2 L-10 9.5 L-14 11 M-10 9.5 L-6.5 15 M-15 5 L-10 9.5 M-17.5 10.5 L-14 11 L-13.5 16" fill="none" className="crystal-facet" />
                {/* Glints */}
                <path d="M-14 -22.5 L-13.7 -20.3 L-11.5 -20 L-13.7 -19.7 L-14 -17.5 L-14.3 -19.7 L-16.5 -20 L-14.3 -20.3 Z" fill="#fff" />
                <path d="M-21.5 -10.8 L-21.3 -9.2 L-19.7 -9 L-21.3 -8.8 L-21.5 -7.2 L-21.7 -8.8 L-23.3 -9 L-21.7 -9.2 Z" fill="#fff" opacity="0.9" />
                <path d="M-17.5 9.2 L-17.3 10.3 L-16.2 10.5 L-17.3 10.7 L-17.5 11.8 L-17.7 10.7 L-18.8 10.5 L-17.7 10.3 Z" fill="#fff" opacity="0.85" />
                <path d="M-12 -14 L-16 -6" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ))}

            {/* Glass body and antennae */}
            <path d="M0 -7 L1.3 -2 L1 7 L0 10.5 L-1 7 L-1.3 -2 Z" fill="#fff" fillOpacity="0.75" className="crystal-edge" />
            <path d="M-0.4 -6.5 Q -2.5 -12 -5.5 -14 M0.4 -6.5 Q 2.5 -12 5.5 -14" fill="none" className="crystal-facet" strokeOpacity="0.9" />
            {/* Lens flare where light catches the body */}
            <g className="crystal-flare">
              <path d="M0 -9 L0.35 -1.5 L0 6 L-0.35 -1.5 Z M-8 -1.5 L0 -1.15 L8 -1.5 L0 -1.85 Z" fill="#fff" />
              <circle cx="0" cy="-1.5" r="1.2" fill="#fff" />
            </g>
          </svg>
        </div>

        {/* Star: hand-drawn doodle — bold outline, scribbled inner star, shine dashes */}
        <div ref={starRef} className="absolute left-0 top-0 opacity-0">
          <svg viewBox="-32 -36 64 64" className="halo-star size-12 md:size-14">
            <defs>
              <filter id="chalk" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" />
                <feDisplacementMap in="SourceGraphic" scale="0.9" />
              </filter>
              <clipPath id="star-inner-clip">
                <path d={INNER_STAR} />
              </clipPath>
            </defs>
            <g filter="url(#chalk)" fill="none" className="chalk-line">
              <g className="star-rays">
                <path d={OUTER_STAR} strokeWidth="2.4" />
                <path d={INNER_STAR} strokeWidth="1.4" />
                {/* Scribble fill inside the small star */}
                <path
                  className="star-scribble"
                  clipPath="url(#star-inner-clip)"
                  strokeWidth="1.5"
                  d="M-12 -8 L10 -10 L-12 -4 L11 -6 L-12 0 L10 -2 L-11 4 L9 2 L-9 8 L8 6 L-6 11 L6 10"
                />
              </g>
              {/* Shine dashes, flashing one after another */}
              <path className="star-cross" style={{ animationDelay: "0s" }} d="M-21 -26 L-16 -21.5" strokeWidth="2.2" />
              <path className="star-cross" style={{ animationDelay: "0.35s" }} d="M-11.5 -33 L-9.5 -26" strokeWidth="2.2" />
              <path className="star-cross" style={{ animationDelay: "0.7s" }} d="M17 -20 L23.5 -24.5" strokeWidth="2.2" />
            </g>
          </svg>
        </div>

        {/* Sparkle burst at the swap points */}
        <div ref={sparkleRef} className="absolute left-0 top-0 opacity-0">
          <svg viewBox="-20 -20 40 40" className="halo-star size-12 md:size-14">
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              const r1 = i % 2 ? 9 : 6;
              const r2 = i % 2 ? 15 : 18;
              return (
                <line
                  key={i}
                  x1={(Math.cos(a) * r1).toFixed(2)}
                  y1={(Math.sin(a) * r1).toFixed(2)}
                  x2={(Math.cos(a) * r2).toFixed(2)}
                  y2={(Math.sin(a) * r2).toFixed(2)}
                  stroke="var(--orbit-ink)"
                  strokeWidth={i % 2 ? 0.8 : 1.2}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
