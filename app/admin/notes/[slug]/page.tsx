"use client";

import { NoteEditor } from "@/components/admin";
import { useNoteBySlug, useUpdateNote } from "@/hooks/useNotes";
import { UpdateNote } from "@/types/note";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: note, isLoading, isPending, error } = useNoteBySlug(slug);
  const updateNote = useUpdateNote();

  const handleSave = async (data: UpdateNote) => {
    if (!note) return;
    await updateNote.mutateAsync({
      id: note.id,
      data: { ...data, tags: data.tags || [] },
    });
    router.push("/admin/notes");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Note</h1>
        <p className="text-muted-foreground">Update your note</p>
      </div>
      <NoteEditor note={note} onSave={handleSave} isLoading={isPending} />
    </div>
  );
}
