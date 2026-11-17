"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBoardMessages, useDeleteBoardMessage } from "@/hooks/useBoard";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBoardPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useBoardMessages();
  const deleteMessage = useDeleteBoardMessage();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const messages = data?.pages.flatMap((p) => p.items) ?? [];

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteMessage.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Message Board
        </h1>
        <p className="text-lg text-muted-foreground">Messages visitors left on Record → K-pop → Message Board</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <p className="py-16 text-center text-lg text-muted-foreground">No messages yet.</p>
      ) : (
        <>
          <div className="border rounded-lg shadow-sm border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-44">Posted</TableHead>
                  <TableHead className="w-20 text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="max-w-xl whitespace-pre-wrap break-words">
                      {m.content}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(m.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete message"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(m.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 size-4 animate-spin" />}
                Load older
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Message"
        description="Delete this message from the board? This can't be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
