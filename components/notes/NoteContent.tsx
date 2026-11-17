"use client";

import { NoteCategory } from "@/types/category";
import { Note } from "@/types/note";
import { format } from "date-fns";
import { ArticleShell } from "../dream/ArticleShell";

interface NoteContentProps {
  note: Note;
  category: NoteCategory | undefined;
}

export const NoteContent = ({ note, category }: NoteContentProps) => {
  const date = format(new Date(note.createdAt), "MMMM d, yyyy");

  return (
    <ArticleShell
      backHref="/notes"
      backLabel="All notes"
      title={note.title}
      meta={
        <>
          <time dateTime={new Date(note.createdAt).toISOString()}>{date}</time>
          {category && <> · {category.name}</>}
        </>
      }
      tags={note.tags}
      content={note.content}
    />
  );
};
