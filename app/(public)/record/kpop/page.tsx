"use client";

import { PageHeader } from "@/components/dream/PageParts";
import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
import Link from "next/link";

type Block = {
  href: string;
  title: string;
  blurb: string;
  /** Center of the badge inside the stage, in % of width / height. */
  at: { left: string; top: string };
  color: string;
};

const blocks: Block[] = [
  {
    href: "/record/kpop/board",
    title: "Message Board",
    blurb: "My Fan Life Journal",
    at: { left: "27%", top: "30%" },
    color: "var(--dream-pink)",
  },
  {
    href: "/record/kpop/cheering",
    title: "Cheering Guide",
    blurb: "Practice with Stage & MVs",
    at: { left: "73%", top: "70%" },
    // Light blue — the theme blue is too dark against the night background.
    color: "#91caff",
  },
];

export default function KpopPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24">
      <PageHeader title="K-pop" meta="every Moments with my idol" />

      {/* Stage: a diagonal line splits it; one star badge on each side */}
      <div className="relative mx-auto aspect-square w-full max-w-2xl md:aspect-[4/3] md:max-w-5xl">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <linearGradient id="kpop-line" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--dream-blue)" stopOpacity="0" />
              <stop offset="20%" stopColor="var(--dream-lilac)" />
              <stop offset="80%" stopColor="var(--dream-pink)" />
              <stop
                offset="100%"
                stopColor="var(--dream-pink)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <motion.line
            x1="12"
            y1="90"
            x2="80"
            y2="10"
            stroke="url(#kpop-line)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="drop-shadow-[0_0_6px_var(--dream-lilac)]"
          />
        </svg>

        {blocks.map((block, i) => (
          <StarBadge key={block.href} block={block} index={i} />
        ))}
      </div>
    </div>
  );
}

function StarBadge({ block, index }: { block: Block; index: number }) {
  const reduceMotion = useReducedMotion();
  const spin = (from: number, dir: 1 | -1, duration: number) =>
    reduceMotion
      ? { initial: { rotate: from }, animate: { rotate: from } }
      : {
          initial: { rotate: from },
          animate: { rotate: from + 360 * dir },
          transition: { duration, repeat: Infinity, ease: "linear" as const },
        };

  // Two rounded squares, 45° apart, form the 8-point star from the sketch.
  const ringStyle: MotionStyle = {
    borderColor: `color-mix(in oklch, ${block.color} 75%, transparent)`,
    boxShadow: `0 0 30px -8px ${block.color}, inset 0 0 24px -12px ${block.color}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        delay: 0.5 + index * 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={block.at}
    >
      <Link
        href={block.href}
        className="group relative flex size-44 items-center justify-center rounded-full outline-none sm:size-60 md:size-80 lg:size-96 focus-visible:ring-2 focus-visible:ring-[var(--dream-lilac)]"
      >
        <motion.span
          aria-hidden
          className="absolute inset-[12%] rounded-[22%] border-2 md:border-[3px] backdrop-blur-[2px] transition-[inset] duration-500 group-hover:inset-[8%]"
          style={ringStyle}
          {...spin(12, 1, 36)}
        />
        <motion.span
          aria-hidden
          className="absolute inset-[12%] rounded-[22%] border-2 md:border-[3px] transition-[inset] duration-500 group-hover:inset-[8%]"
          style={ringStyle}
          {...spin(57, -1, 48)}
        />
        {/* Soft fill so the label reads over the background */}
        <span
          aria-hidden
          className="absolute inset-[24%] rounded-full opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `color-mix(in oklch, ${block.color} 35%, transparent)`,
          }}
        />

        <span className="relative flex flex-col items-center gap-1.5 px-2 text-center">
          <span className="font-display italic text-[22px] leading-tight sm:text-[26px] md:text-[32px]">
            {block.title}
          </span>
          <span className="hidden text-[14px] text-muted-foreground sm:block">
            {block.blurb}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
