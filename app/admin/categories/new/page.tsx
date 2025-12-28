"use client";

import { CategoryEditor } from "@/components/admin";
import { useCreateCategory } from "@/hooks/useCategories";
import { CreateNoteCategory } from "@/types/category";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const handleSave = async (data: CreateNoteCategory) => {
    await createCategory.mutateAsync(data);
    router.push("/admin/categories");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Category</h1>
        <p className="text-muted-foreground">Create a new note category</p>
      </div>
      <CategoryEditor onSave={handleSave} />
    </div>
  );
}
