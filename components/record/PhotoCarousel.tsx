"use client";

import { cn } from "@/lib/utils";
import type { DailyImage } from "@/types/daily";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface PhotoCarouselProps {
  images: DailyImage[];
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
  sizes?: string;
  /** "cover" crops to fill (cards); "contain" shows the whole photo (modal). */
  fit?: "cover" | "contain";
}

const SWIPE_THRESHOLD = 50;

export function PhotoCarousel({
  images,
  index,
  onIndexChange,
  className,
  sizes = "(min-width: 768px) 33vw, 100vw",
  fit = "cover",
}: PhotoCarouselProps) {
  const [direction, setDirection] = useState(0);
  const draggedRef = useRef(false);
  const count = images.length;
  const current = images[index];

  const go = (next: number) => {
    if (next < 0 || next >= count) return;
    setDirection(next > index ? 1 : -1);
    onIndexChange(next);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1);
  };

  if (!current) return null;

  return (
    <div
      className={cn("group/carousel relative overflow-hidden select-none", className)}
      // A swipe ends with a click event; swallow it so the parent card doesn't open.
      onClickCapture={(e) => {
        if (draggedRef.current) {
          e.stopPropagation();
          draggedRef.current = false;
        }
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current.url + index}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d >= 0 ? "100%" : "-100%", opacity: 0.6 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d >= 0 ? "-100%" : "100%", opacity: 0.6 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragStart={() => (draggedRef.current = true)}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <Image
            src={current.url}
            alt={current.caption || `Photo ${index + 1}`}
            fill
            sizes={sizes}
            draggable={false}
            className={fit === "cover" ? "object-cover" : "object-contain"}
          />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <ArrowButton side="left" disabled={index === 0} onClick={() => go(index - 1)} />
          <ArrowButton side="right" disabled={index === count - 1} onClick={() => go(index + 1)} />

          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((img, i) => (
              <span
                key={img.url + i}
                className={cn(
                  "h-1.5 rounded-full bg-white/90 shadow transition-all duration-300",
                  i === index ? "w-4" : "w-1.5 opacity-50",
                )}
              />
            ))}
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-black/45 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center bg-white/80 text-black shadow-md backdrop-blur-sm transition-opacity",
        "opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 disabled:!opacity-0",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
