"use client";

import { PageHeader } from "@/components/dream/PageParts";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowUpRight,
  Clapperboard,
  Music,
  Sun,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Block = { href: string; title: string; blurb: string; icon: LucideIcon };

const blocks: Block[] = [
  {
    href: "/record/daily",
    title: "Daily",
    blurb: "Little moments from everyday life.",
    icon: Sun,
  },
  {
    href: "/record/film",
    title: "Film Review",
    blurb: "Thoughts on movies & series",
    icon: Clapperboard,
  },
  {
    href: "/record/kpop",
    title: "K-pop",
    blurb: "Keeping my fan memories.",
    icon: Music,
  },
];

/** Vertical orbit radius in px (center → card center). */
const RADIUS_Y = 210;
/** Widest the horizontal radius may get; it shrinks to fit narrower screens. */
const MAX_RADIUS_X = 430;
/** Half the card width (w-72 = 288px) plus breathing room at the edges. */
const CARD_HALF_W = 144 + 16;
/** Degrees per second; one full lap takes 360 / SPEED seconds. */
const SPEED = 9;

export default function RecordPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Record" meta="Pick a corner of everyday life" />

      {/* Desktop / laptop: three blocks orbiting a circle, clockwise */}
      <Orbit />

      {/* Phone / tablet: simple stacked list */}
      <div className="grid gap-5 sm:grid-cols-2 md:hidden">
        {blocks.map((block, i) => (
          <motion.div
            key={block.href}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.15 + i * 0.1,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <BlockCard block={block} className="min-h-48" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Orbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(0);
  // Horizontal radius follows the container width, so the orbit uses the side space.
  const radiusX = useMotionValue(MAX_RADIUS_X);
  const paused = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      radiusX.set(
        Math.max(
          RADIUS_Y,
          Math.min(MAX_RADIUS_X, el.clientWidth / 2 - CARD_HALF_W),
        ),
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radiusX]);

  useAnimationFrame((_, delta) => {
    if (paused.current || reduceMotion) return;
    angle.set((angle.get() + (delta / 1000) * SPEED) % 360);
  });

  const ringWidth = useTransform(radiusX, (r) => r * 2);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto hidden md:block h-[660px] w-full"
      // Pause while the cursor (or keyboard focus) is on the orbit, so cards are easy to click.
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      {/* The orbit ring (an ellipse, stretched to fill the width) */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[color-mix(in_oklch,var(--dream-lilac)_45%,transparent)] shadow-[0_0_60px_-20px_var(--dream-lilac),inset_0_0_60px_-30px_var(--dream-lilac)]"
        style={{ width: ringWidth, height: RADIUS_Y * 2 }}
      />
      {/* Soft glow in the middle */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--dream-lilac)_30%,transparent),transparent_70%)] blur-xl"
      />

      {blocks.map((block, i) => (
        <OrbitItem
          key={block.href}
          block={block}
          angle={angle}
          radiusX={radiusX}
          offset={(360 / blocks.length) * i}
        />
      ))}
    </motion.div>
  );
}

function OrbitItem({
  block,
  angle,
  radiusX,
  offset,
}: {
  block: Block;
  angle: MotionValue<number>;
  radiusX: MotionValue<number>;
  offset: number;
}) {
  // 0° = top; increasing angle moves clockwise on screen. Cards stay upright.
  const x = useTransform(
    [angle, radiusX],
    ([a, rx]: number[]) => rx * Math.sin(((a + offset) * Math.PI) / 180),
  );
  const y = useTransform(
    angle,
    (a) => -RADIUS_Y * Math.cos(((a + offset) * Math.PI) / 180),
  );

  return (
    // Outer div centers the card on the orbit point; motion x/y move it around the circle.
    <motion.div
      className="absolute left-1/2 top-1/2 -ml-36 -mt-[6.5rem] w-72"
      style={{ x, y }}
    >
      <BlockCard block={block} className="h-52" />
    </motion.div>
  );
}

function BlockCard({ block, className }: { block: Block; className?: string }) {
  const Icon = block.icon;
  return (
    <Link
      href={block.href}
      className={`glass group flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--dream-lilac),0_20px_40px_-16px_var(--dream-lilac)] ${className ?? ""}`}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--dream-lilac)_22%,transparent)]">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
      <div>
        <h2 className="font-display italic text-3xl">{block.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {block.blurb}
        </p>
      </div>
    </Link>
  );
}
