"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, X } from "lucide-react";
import { useEffect, useState } from "react";

const SEEN_KEY = "desktop-hint-seen";
const SHOW_AFTER_MS = 1500;
const HIDE_AFTER_MS = 7000;

/**
 * On phone-sized screens, a small note in the bottom-right corner suggesting a
 * computer for the full effects. Shown once per visit (sessionStorage), hides
 * itself after a few seconds, and can be closed.
 */
export function DesktopHint() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked (private mode): still show it once for this page load.
    }
    const show = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    const hide = setTimeout(() => setOpen(false), SHOW_AFTER_MS + HIDE_AFTER_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass fixed bottom-4 right-4 z-50 flex max-w-[16rem] items-center gap-2.5 rounded-2xl py-2.5 pl-3.5 pr-2 text-sm shadow-lg"
        >
          <Monitor className="size-4 shrink-0 text-[var(--dream-lilac)]" aria-hidden />
          <span className="leading-snug">Use a computer to get a better experience</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-[var(--dream-lilac)]"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
