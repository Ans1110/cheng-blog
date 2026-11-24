"use client";

import { Learning } from "@/types/learning";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import { useRef } from "react";
import { SectionHeader } from "../ui/section-header";

interface LearningTimeLineProps {
  data: Learning[];
}

const fadeIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const LearningTimeLine = ({ data }: LearningTimeLineProps) => {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  const sorted = [...(data ?? [])].sort((a, b) => b.year - a.year);

  return (
    <>
      <SectionHeader title="Journey" />

      {sorted.length === 0 ? (
        <p className="text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ol ref={ref} className="relative pl-8 md:pl-12 space-y-6">
          {/* Track + glowing fill that grows as you scroll */}
          <span aria-hidden className="absolute left-2.5 md:left-4 top-2 bottom-2 w-px bg-border" />
          <motion.span
            aria-hidden
            style={{ scaleY: lineScale }}
            className="absolute left-2.5 md:left-4 top-2 bottom-2 w-px origin-top bg-[linear-gradient(180deg,var(--dream-pink),var(--dream-lilac),var(--dream-blue))] shadow-[0_0_12px_1px_var(--dream-lilac)]"
          />

          {sorted.map((entry) => (
            <motion.li
              key={entry.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeIn}
              className="relative"
            >
              <span
                aria-hidden
                className="absolute -left-8 md:-left-12 top-6 ml-[5px] md:ml-[11px] size-3 rounded-full bg-[var(--dream-pink)] shadow-[0_0_14px_3px_var(--dream-pink)] animate-pulse"
              />
              <div className="glass rounded-3xl p-6 md:p-7">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                  <span className="font-display italic text-4xl text-dream leading-none">{entry.year}</span>
                  <span className="text-muted-foreground">{entry.title}</span>
                </div>
                {entry.skills && entry.skills.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {entry.skills.map((skill) => (
                      <li key={skill} className="pill">
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </>
  );
};
