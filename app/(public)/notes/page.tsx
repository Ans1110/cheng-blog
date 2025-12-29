"use client";

import { NotesPageClient } from "@/components/notes/NotesPageClient";
import { useCategories } from "@/hooks/useCategories";
import { useNotes } from "@/hooks/useNotes";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function NotesPage() {
  const { data: notes, isLoading: isNotesLoading } = useNotes();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const categoryCounts = useMemo(() => {
    if (!notes) return {};
    return notes.reduce((acc, note) => {
      const categoryId = note.category || "uncategorized";
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [notes]);

  if (isNotesLoading || isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading notes...</p>
      </div>
    );
  }

  return (
    <NotesPageClient
      notes={notes || []}
      categories={categories || []}
      categoryCounts={categoryCounts}
    />
  );
}
