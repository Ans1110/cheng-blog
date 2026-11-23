"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MaskImage } from "../dream/MaskImage";
import { HaloOrbit } from "./HaloOrbit";

const TITLE = "Cheng";

export const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scrolling away dissolves the hero like waking up
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const titleBlur = useTransform(
    scrollYProgress,
    [0.25, 0.9],
    ["blur(0px)", "blur(12px)"],
  );
  const fade = useTransform(scrollYProgress, [0.15, 0.8], [1, 0]);
  const wingsY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const haloScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100svh-5rem)] flex items-center justify-center overflow-hidden"
    >
      {/* Halo ring behind the title */}
      <motion.div
        aria-hidden
        style={{ scale: haloScale, opacity: fade }}
        className="absolute size-[min(80vw,560px)] rounded-full"
      >
        <div className="absolute inset-0 rounded-full animate-halo opacity-70 blur-xl bg-[conic-gradient(from_0deg,var(--dream-pink),var(--dream-lilac),var(--dream-blue),var(--dream-mint),var(--dream-butter),var(--dream-pink))]" />
        <div className="absolute inset-[8%] rounded-full bg-background/80 blur-lg" />
        <HaloOrbit />
      </motion.div>

      {/* Floating pixel wings (md+; on phones they sit beside the title instead) */}
      <motion.div
        aria-hidden
        style={{ y: wingsY, opacity: fade }}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex justify-between px-[10vw] pointer-events-none"
      >
        <div className="animate-float">
          <MaskImage
            src="/left_wing.svg"
            className="w-16 h-28 md:w-28 md:h-48 lg:w-32 lg:h-56 opacity-80"
          />
        </div>
        <div className="animate-float [animation-delay:-3.5s]">
          <MaskImage
            src="/right_wing.svg"
            className="w-16 h-28 md:w-28 md:h-48 lg:w-32 lg:h-56 opacity-80"
          />
        </div>
      </motion.div>

      <motion.div
        style={{ y: titleY, filter: titleBlur, opacity: fade }}
        className="relative z-10 container text-center"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.24em" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="eyebrow mb-6"
        >
          ✧ blog ✧
        </motion.p>

        <h1
          aria-label={TITLE}
          className="font-display italic leading-[0.85] text-[clamp(5rem,20vw,13rem)] tracking-tight"
        >
          <span className="relative inline-block">
          {/* Phones: wings hug the word, centred on it, so they don't drift
              down beside the subtitle when the hero stacks tall. */}
          <span
            aria-hidden
            className="md:hidden absolute right-full top-1/2 -translate-y-1/2 mr-[0.06em] pointer-events-none"
          >
            <MaskImage src="/left_wing.svg" className="w-[0.55em] h-[0.95em] opacity-80 animate-float" />
          </span>
          <span
            aria-hidden
            className="md:hidden absolute left-full top-1/2 -translate-y-1/2 ml-[0.06em] pointer-events-none"
          >
            <MaskImage src="/right_wing.svg" className="w-[0.55em] h-[0.95em] opacity-80 animate-float [animation-delay:-3.5s]" />
          </span>
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.25 + i * 0.09,
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block text-dream pr-[0.04em]"
            >
              {ch}
            </motion.span>
          ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 text-base md:text-lg text-muted-foreground max-w-md mx-auto"
        >
          The things I love, and what I&rsquo;m learning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/posts" className="btn-dream group">
            Read posts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/record"
            className="glass rounded-full px-6 py-3 font-semibold hover:-translate-y-0.5 transition-transform"
          >
            My Life
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
