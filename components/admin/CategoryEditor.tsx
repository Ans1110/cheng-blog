"use client";

import { NoteCategory } from "@/types/category";
import { createNoteCategorySchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ControlledInput } from "../ui/controlled-input";
import { ControlledTextarea } from "../ui/controlled-textarea";

type CategoryFormData = z.infer<typeof createNoteCategorySchema>;

interface CategoryEditorProps {
  category?: NoteCategory;
  onSave: (data: CategoryFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CategoryEditor = ({
  category,
  onSave,
  isLoading = false,
}: CategoryEditorProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(createNoteCategorySchema),
    defaultValues: {
      id: category?.id || "",
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Category"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <ControlledInput
                name="id"
                label="ID *"
                placeholder="Enter category ID"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <ControlledInput
                name="name"
                label="Name *"
                placeholder="Enter category name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <ControlledTextarea
                name="description"
                label="Description"
                placeholder="Enter category description"
                className="w-full"
              />
            </div>

          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
