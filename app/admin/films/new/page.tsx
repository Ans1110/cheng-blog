"use client";

import FilmEditor from "@/components/admin/FilmEditor";
import { useCreateFilmReview } from "@/hooks/useFilms";
import type { CreateFilmReviewInput } from "@/utils/validation";
import { useRouter } from "next/navigation";

export default function NewFilmReviewPage() {
  const router = useRouter();
  const createFilm = useCreateFilmReview();

  const handleSave = async (data: CreateFilmReviewInput) => {
    await createFilm.mutateAsync(data);
    router.push("/admin/films");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Film Review</h1>
        <p className="text-muted-foreground">Rate it, sum it up in a line, then write the full review</p>
      </div>
      <FilmEditor onSave={handleSave} />
    </div>
  );
}
