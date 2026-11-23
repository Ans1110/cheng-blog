"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  meta,
  size = "md",
}: {
  title: ReactNode;
  meta?: ReactNode;
  /** "sm" is ~18% smaller, for pages where the title shouldn't dominate. */
  size?: "md" | "sm";
}) {
  return (
    <header className="pt-10 md:pt-16 mb-10 md:mb-14 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "font-display italic leading-none tracking-tight",
          size === "sm" ? "text-5xl md:text-[5rem]" : "text-6xl md:text-8xl",
        )}
      >
        <span className="text-dream">{title}</span>
      </motion.h1>
      {meta && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="eyebrow mt-5"
        >
          {meta}
        </motion.p>
      )}
    </header>
  );
}

export function SearchField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label htmlFor={id} className="glass group flex items-center gap-3 rounded-full px-5 h-12 focus-within:shadow-[0_0_0_2px_var(--dream-lilac),0_0_30px_-4px_var(--dream-pink)] transition-shadow">
      <Search className="size-4 text-muted-foreground group-focus-within:text-[var(--glow)] transition-colors" />
      <span className="sr-only">Search</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  );
}

export function TagChip({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all hover:-translate-y-0.5",
        active
          ? // Light mode: solid lilac; dark mode keeps the dream gradient.
            "text-[var(--on-dream)] bg-[color:var(--dream-lilac)] dark:bg-[linear-gradient(110deg,var(--dream-pink),var(--dream-lilac),var(--dream-blue))] shadow-[0_6px_20px_-6px_var(--dream-lilac)]"
          : "pill hover:border-[var(--dream-pink)]",
      )}
    >
      {label}
      {children}
    </button>
  );
}
