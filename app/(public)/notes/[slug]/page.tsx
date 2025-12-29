"use client";

import { NoteContent } from "@/components/notes";
import { useCategories } from "@/hooks/useCategories";
import { useNoteBySlug } from "@/hooks/useNotes";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function NotePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: note, isLoading, error } = useNoteBySlug(slug);
  const { data: categories } = useCategories();

  const category = categories?.find((c) => c.id === note?.category);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Note Not Found</h1>
        <p className="text-muted-foreground">
          The note you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return <NoteContent note={note} category={category} />;
}
