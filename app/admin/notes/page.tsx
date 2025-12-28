"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteNote, useNotes } from "@/hooks/useNotes";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminNotesPage() {
  const { data: notes, isLoading } = useNotes();
  const { data: categories } = useCategories();
  const deleteNote = useDeleteNote();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteNote.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success("Note deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete note");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your notes ({categories?.length || 0} categories)
          </p>
        </div>
        <Link href="/admin/notes/new">
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 size-4" />
            New Note
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading notes...</p>
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No notes yet. Create your first note!
          </p>
          <Link href="/admin/notes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes?.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{note.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/notes/${note.slug}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
