import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";

interface RecentNotesListProps {
  notes: Note[];
  isLoading?: boolean;
}

export function RecentNotesList({ notes, isLoading }: RecentNotesListProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Recent Notes</CardTitle>
        <CardDescription>The latest notes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link
                    href={`/admin/notes/${note.id}`}
                    className="font-medium hover:underline"
                  >
                    {note.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {note.category} -{" "}
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Link href={`/admin/notes/${note.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
