"use client";

import { MarkdownRenderer } from "@/components/markdown/MarkDownRenderer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { DailyPost } from "@/types/daily";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PhotoCarousel } from "./PhotoCarousel";

interface DailyPostModalProps {
  post: DailyPost | null;
  initialIndex: number;
  onClose: () => void;
}

export function DailyPostModal({ post, initialIndex, onClose }: DailyPostModalProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(initialIndex);
  }, [post, initialIndex]);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(post.images.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [post]);

  const caption = post?.images[index]?.caption;

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      {/* Phones: a column sized to the visible screen (dvh excludes the address bar), photo on
          top with a capped height and the story filling the rest with its own scroll. Before,
          photo + a 50vh text box overflowed the dialog and the story's end was cut off. */}
      <DialogContent className="glass gap-0 p-0 overflow-hidden rounded-3xl sm:max-w-5xl max-h-[90dvh] flex flex-col md:grid md:max-h-[90vh] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {post && (
          <>
            {/* Left: photo collection */}
            <div className="relative shrink-0 bg-black/90 flex flex-col">
              <PhotoCarousel
                images={post.images}
                index={index}
                onIndexChange={setIndex}
                fit="contain"
                sizes="(min-width: 768px) 60vw, 100vw"
                className="aspect-[4/5] max-h-[45dvh] md:max-h-none md:aspect-auto md:h-[80vh] w-full"
              />
              {caption && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-9 inset-x-4 text-center text-sm text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] pointer-events-none"
                  >
                    {caption}
                  </motion.p>
                </AnimatePresence>
              )}
            </div>

            {/* Right: long text */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-8 md:max-h-[80vh]">
              <time className="eyebrow text-xs" dateTime={post.createdAt}>
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
              </time>
              <DialogTitle className="font-display italic text-3xl md:text-4xl leading-tight mt-2 mb-5 pr-6">
                <span className="text-dream">{post.title}</span>
              </DialogTitle>
              <DialogDescription className="sr-only">{post.title}</DialogDescription>
              {post.content ? (
                <MarkdownRenderer content={post.content} className="prose-sm md:prose-base" />
              ) : (
                <p className="text-muted-foreground">No story for this one — just photos.</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
