"use client";

import FilmEditor from "@/components/admin/FilmEditor";
import { useFilmReviewById, useUpdateFilmReview } from "@/hooks/useFilms";
import type { CreateFilmReviewInput } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditFilmReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: film, isLoading, error } = useFilmReviewById(id);
  const updateFilm = useUpdateFilmReview();

  const handleSave = async (data: CreateFilmReviewInput) => {
    await updateFilm.mutateAsync({ id, data });
    router.push("/admin/films");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="size-4 animate-spin" /> Loading review...
      </div>
    );
  }

  if (error || !film) {
    return <p className="text-destructive py-12">{error?.message || "Review not found"}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Film Review</h1>
        <p className="text-muted-foreground">{film.title}</p>
      </div>
      <FilmEditor key={film.id} film={film} onSave={handleSave} />
    </div>
  );
}
