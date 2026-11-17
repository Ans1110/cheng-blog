"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import MarkdownRenderer from "../markdown/MarkDownRenderer";

const proseClasses = [
  "prose prose-base md:prose-lg dark:prose-invert max-w-none",
  "prose-headings:font-display prose-headings:font-normal prose-headings:tracking-tight",
  "prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-3xl prose-h3:italic",
  "prose-p:leading-relaxed prose-p:text-foreground/85",
  "prose-a:text-[var(--glow)] prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4",
  "prose-strong:text-foreground",
  "prose-blockquote:font-display prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:border-l-2 prose-blockquote:border-[var(--dream-lilac)] prose-blockquote:text-foreground/80",
  "prose-code:font-mono prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:rounded-2xl prose-pre:border prose-pre:border-[var(--glass-border)]",
  "prose-img:rounded-2xl",
  "prose-hr:border-[var(--dream-lilac)]/40",
].join(" ");

interface ArticleShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  meta: ReactNode;
  lede?: string | null;
  tags?: string[] | null;
  content: string;
}

export function ArticleShell({ backHref, backLabel, title, meta, lede, tags, content }: ArticleShellProps) {
  return (
    <article className="container pt-8 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href={backHref}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          {backLabel}
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 mb-10 md:mb-12 text-center"
        >
          <p className="eyebrow mb-5">{meta}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">{title}</h1>
          {lede && (
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {lede}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {tags.map((t) => (
                <span key={t} className="pill">
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl px-5 py-8 sm:px-8 md:px-12 md:py-12"
        >
          <div className={proseClasses}>
            <MarkdownRenderer content={content} />
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <span aria-hidden className="text-[var(--glow)] tracking-[1em] animate-twinkle inline-block">
            ✦ ✧ ✦
          </span>
        </div>
      </div>
    </article>
  );
}
