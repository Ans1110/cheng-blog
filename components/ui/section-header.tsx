"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Optional "see all" link shown on the right */
  href?: string;
  linkLabel?: string;
}

const SectionHeader = ({ title, description, href, linkLabel = "See all" }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end justify-between gap-6 mb-10 md:mb-14"
    >
      <div>
        <h2 className="font-display italic text-5xl md:text-6xl leading-none tracking-tight">
          <span className="text-[var(--glow)] mr-2 text-3xl md:text-4xl align-middle animate-twinkle inline-block">
            ✦
          </span>
          {title}
        </h2>
        {description && <p className="mt-3 text-muted-foreground max-w-md">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </motion.div>
  );
};

export default SectionHeader;
export { SectionHeader };
