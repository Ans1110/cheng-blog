"use client";

import { NoteCategory } from "@/types/category";
import { Note } from "@/types/note";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Card, CardContent } from "../ui/card";
import MarkdownRenderer from "../markdown/MarkDownRenderer";

interface NoteContentProps {
  note: Note;
  category: NoteCategory | undefined;
}

export const NoteContent = ({ note, category }: NoteContentProps) => {
  return (
    <div className="container py-12 space-y-10">
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Back to Notes
      </Link>

      <header className="space-y-6 mb-10">
        <Link
          href={`/notes?category=${note.category}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <span className="text-sm font-medium">
            {category?.name || note.category}
          </span>
        </Link>

        <h1 className="text-4xl md:text-5xk font-bold tracking-tight">
          {note.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={new Date(note.createdAt).toISOString()}>
              {format(new Date(note.createdAt), "MMMM d, yyyy")}
            </time>
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <Card className="border-border/50">
        <CardContent className="pt-8 pb-12">
          <article className="prose prose-zinc dark:prose-invert max-w-none">
            <MarkdownRenderer content={note.content} />
          </article>
        </CardContent>
      </Card>

      {/* Footer navigation */}
      <div className="mt-10 pt-8 border-t">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to all notes
        </Link>
      </div>
    </div>
  );
};
