"use client";

import type { BoardMessage } from "@/types/board";
import { motion, useReducedMotion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { rand, SoapBubble } from "./SoapBubble";

/**
 * Size grows a little with message length, plus some randomness,
 * and each bubble sits slightly off the line so the wall feels like floating bubbles, not a menu.
 */
export function bubbleLayout(seed: number, length = 0) {
  const base = length < 40 ? 8 : length < 120 ? 9.5 : 11; // rem
  return {
    size: base + rand(seed + 7) * 3, // rem
    offsetY: (rand(seed + 13) - 0.5) * 70, // px
    offsetX: (rand(seed + 21) - 0.5) * 24, // px
    bob: 6 + rand(seed + 29) * 8, // px
    duration: 4 + rand(seed + 31) * 3, // s
  };
}

export function MessageBubble({
  message,
  index,
  onOpen,
}: {
  message: BoardMessage;
  index: number;
  onOpen: (message: BoardMessage) => void;
}) {
  const reduceMotion = useReducedMotion();
  const l = bubbleLayout(message.id, message.content.length);

  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ delay: Math.min(index, 14) * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="list-none"
      style={{ translate: `${l.offsetX}px ${l.offsetY}px` }}
    >
      <motion.button
        type="button"
        onClick={() => onOpen(message)}
        aria-label="Open message"
        animate={reduceMotion ? undefined : { y: [0, -l.bob, 0] }}
        transition={{ duration: l.duration, repeat: Infinity, ease: "easeInOut", delay: rand(message.id) * 2 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex items-center justify-center rounded-full p-7 text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--dream-lilac)]"
        style={{ width: `${l.size}rem`, height: `${l.size}rem` }}
      >
        <SoapBubble seed={message.id} />
        {message.content ? (
          <span className="sb-text relative line-clamp-5 wrap-anywhere text-sm leading-snug transition-opacity duration-300 opacity-90 group-hover:opacity-100">
            {message.content}
          </span>
        ) : (
          // Photo-only message: no text to show until it's opened.
          <ImageIcon className="sb-text relative size-6 opacity-70 transition-opacity group-hover:opacity-100" />
        )}
      </motion.button>
    </motion.li>
  );
}
