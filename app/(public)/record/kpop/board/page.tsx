"use client";

import { PageHeader } from "@/components/dream/PageParts";
import { MessageBubble } from "@/components/record/board/MessageBubble";
import { MessageForm } from "@/components/record/board/MessageForm";
import { SoapBubble } from "@/components/record/board/SoapBubble";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useAdminAuth from "@/hooks/useAdminAuth";
import { useBoardMessages, useDeleteBoardMessage } from "@/hooks/useBoard";
import type { BoardMessage } from "@/types/board";
import { format } from "date-fns";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MessageBoardPage() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBoardMessages();
  // The session cookie is httpOnly, so ask the server; never redirects visitors.
  const { isAuthenticated: isAdmin } = useAdminAuth(false);
  const deleteMessage = useDeleteBoardMessage();
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState<BoardMessage | null>(null);

  const messages = data?.pages.flatMap((p) => p.items) ?? [];

  const handleDelete = async (id: number) => {
    try {
      await deleteMessage.mutateAsync(id);
      setOpen(null);
      toast.success("Bubble removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Message Board" meta="My Fan Life Journal" size="sm" />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-20 text-center text-muted-foreground">
          {error.message}
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-10 py-8 md:gap-x-8 md:gap-y-12">
            {isAdmin && (
              <motion.li
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="list-none"
              >
                <motion.button
                  type="button"
                  onClick={() => setComposing(true)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex size-32 flex-col items-center justify-center gap-1 rounded-full font-display italic text-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--dream-lilac)]"
                  aria-label="New message"
                >
                  <SoapBubble seed={0} />
                  <Plus className="sb-text relative size-5" />
                  <span className="sb-text relative">new</span>
                </motion.button>
              </motion.li>
            )}

            <AnimatePresence initial>
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  index={i}
                  onOpen={setOpen}
                />
              ))}
            </AnimatePresence>

            {hasNextPage && (
              <li className="list-none">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  aria-label="Load older messages"
                  className="flex size-16 items-center justify-center rounded-full text-2xl font-bold tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "…"
                  )}
                </button>
              </li>
            )}
          </ul>

          {messages.length === 0 && !isAdmin && (
            <p className="py-16 text-center text-muted-foreground">
              No messages yet.
            </p>
          )}
        </>
      )}

      {/* Read a bubble */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="glass rounded-3xl sm:max-w-lg overflow-hidden">
          {open && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full blur-3xl opacity-30 bg-[var(--dream-lilac)]"
              />
              <DialogTitle className="sr-only">Message</DialogTitle>
              {open.imageUrl && (
                <div className="relative -mx-2 mt-2 aspect-[4/3] overflow-hidden rounded-2xl bg-black/30">
                  <Image
                    src={open.imageUrl}
                    alt="Photo attached to the message"
                    fill
                    sizes="(min-width: 640px) 28rem, 100vw"
                    className="object-contain"
                  />
                </div>
              )}
              <DialogDescription asChild>
                <p className="relative whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
                  {open.content || (open.imageUrl ? "" : "\u00a0")}
                </p>
              </DialogDescription>
              <div className="relative flex items-center justify-between">
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={open.createdAt}
                >
                  {format(new Date(open.createdAt), "MMM d, yyyy · HH:mm")}
                </time>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(open.id)}
                    disabled={deleteMessage.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose (admin only) */}
      {isAdmin && (
        <Dialog open={composing} onOpenChange={setComposing}>
          <DialogContent className="glass rounded-3xl sm:max-w-lg overflow-hidden">
            <DialogTitle className="font-display italic text-2xl">
              New message
            </DialogTitle>
            <DialogDescription className="sr-only">
              Write a new message bubble
            </DialogDescription>
            <MessageForm onPosted={() => setComposing(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
