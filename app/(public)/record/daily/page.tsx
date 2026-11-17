"use client";

import { PageHeader } from "@/components/dream/PageParts";
import { DailyPostCard } from "@/components/record/DailyPostCard";
import { DailyPostModal } from "@/components/record/DailyPostModal";
import { useDailyPosts } from "@/hooks/useDaily";
import type { DailyPost } from "@/types/daily";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const PAGE_SIZE_DESKTOP = 6;
const PAGE_SIZE_MOBILE = 3;
const MOBILE_QUERY = "(max-width: 639px)";

const subscribeMobile = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/** 3 posts per batch on phones (one column), 6 elsewhere. */
const usePageSize = () =>
  useSyncExternalStore(
    subscribeMobile,
    () => (window.matchMedia(MOBILE_QUERY).matches ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP),
    () => PAGE_SIZE_DESKTOP,
  );

export default function DailyPage() {
  const { data: posts, isLoading, error } = useDailyPosts();
  const [open, setOpen] = useState<{ post: DailyPost; index: number } | null>(null);
  const pageSize = usePageSize();
  const [batches, setBatches] = useState(1);
  const visibleCount = batches * pageSize;

  const visible = posts?.slice(0, visibleCount) ?? [];
  const remaining = (posts?.length ?? 0) - visible.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Daily" meta="Little moments from everyday life" />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="text-center text-muted-foreground py-20">{error.message}</p>
      ) : !posts || posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Nothing here yet.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={true}>
              {visible.map((post, i) => {
                // Stagger within each batch, so newly revealed posts cascade in.
                const batchIndex = i % pageSize;
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 40, scale: 0.96, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ delay: 0.08 + batchIndex * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <DailyPostCard post={post} onOpen={(p, index) => setOpen({ post: p, index })} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {remaining > 0 && (
            <motion.div layout className="relative mt-10 flex justify-center">
              <motion.button
                type="button"
                onClick={() => setBatches((n) => n + 1)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="btn-dream group inline-flex items-center gap-2 !px-6 !py-3 text-sm"
              >
                Show more
                <span className="opacity-70">({remaining})</span>
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ChevronDown className="size-4" />
                </motion.span>
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      <DailyPostModal
        post={open?.post ?? null}
        initialIndex={open?.index ?? 0}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
