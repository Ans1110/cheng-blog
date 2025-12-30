"use client";

import { CategoryEditor } from "@/components/admin";
import { useCategoryById, useUpdateCategory } from "@/hooks/useCategories";
import { UpdateNoteCategory } from "@/types/category";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditCategoryClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: category, isLoading, isPending, error } = useCategoryById(id);
  const updateCategory = useUpdateCategory();

  const handleSave = async (data: UpdateNoteCategory) => {
    await updateCategory.mutateAsync({
      id,
      data,
    });
    router.push("/admin/categories");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
        <p className="text-muted-foreground">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Error Loading Category</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">Update category information</p>
      </div>
      <CategoryEditor
        category={category}
        onSave={handleSave}
        isLoading={isPending}
      />
    </div>
  );
}
