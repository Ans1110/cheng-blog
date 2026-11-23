"use client";

import { kindLabel } from "@/components/record/film/FilmCard";
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
import { useDeleteFilmReview, useFilmReviews } from "@/hooks/useFilms";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminFilmsPage() {
  const { data: films, isLoading } = useFilmReviews();
  const deleteFilm = useDeleteFilmReview();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteFilm.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Film Reviews
          </h1>
          <p className="text-lg text-muted-foreground">Reviews for Record → Film Review</p>
        </div>
        <Link href="/admin/films/new">
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading reviews...</p>
        </div>
      ) : !films || films.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No reviews yet.</p>
          <Link href="/admin/films/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Poster</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Top 5</TableHead>
                <TableHead>Watched</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {films.map((film) => (
                <TableRow key={film.id}>
                  <TableCell>
                    <div className="relative h-14 w-10 overflow-hidden rounded bg-muted">
                      {film.posterUrl && (
                        <Image src={film.posterUrl} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{film.title}</TableCell>
                  <TableCell>{kindLabel[film.kind]}</TableCell>
                  <TableCell>{film.year}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {film.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {film.topRank ? (
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-amber-400/15 text-sm font-bold text-amber-500">
                        {film.topRank}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{film.watchedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/films/${film.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(film.id)}
                      >
                        <Trash2 className="size-4" />
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
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
