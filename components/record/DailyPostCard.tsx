"use client";

import type { DailyPost } from "@/types/daily";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PhotoCarousel } from "./PhotoCarousel";

interface DailyPostCardProps {
  post: DailyPost;
  onOpen: (post: DailyPost, index: number) => void;
}

export function DailyPostCard({ post, onOpen }: DailyPostCardProps) {
  const [index, setIndex] = useState(0);
  const caption = post.images[index]?.caption;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(post, index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(post, index);
        }
      }}
      aria-label={`Open ${post.title}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--dream-lilac),0_20px_40px_-16px_var(--dream-lilac)] focus-visible:outline-2 focus-visible:outline-[var(--dream-lilac)]"
    >
      <PhotoCarousel
        images={post.images}
        index={index}
        onIndexChange={setIndex}
        className="aspect-[4/5] w-full bg-muted"
      />

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display italic text-xl leading-tight line-clamp-1">{post.title}</h2>
          <time className="eyebrow shrink-0 text-xs" dateTime={post.createdAt}>
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </time>
        </div>
        {/* Caption follows the photo that's showing */}
        <div className="relative min-h-[3.75rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed text-muted-foreground line-clamp-3"
            >
              {caption || " "}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}
