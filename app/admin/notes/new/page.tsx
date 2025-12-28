"use client";

import { NoteEditor } from "@/components/admin";
import { useCreateNote } from "@/hooks/useNotes";
import { CreateNote } from "@/types/note";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();
  const createNote = useCreateNote();

  const handleSave = async (data: CreateNote) => {
    await createNote.mutateAsync(data);
    router.push("/admin/notes");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Note</h1>
        <p className="text-muted-foreground">Create a new note</p>
      </div>
      <NoteEditor onSave={handleSave} isLoading={createNote.isPending} />
    </div>
  );
}
