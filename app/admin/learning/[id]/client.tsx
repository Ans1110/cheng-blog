"use client";

import { LearningEditor } from "@/components/admin";
import { useLearningById, useUpdateLearning } from "@/hooks/useLearning";
import { UpdateLearning } from "@/types/learning";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditLearningClient() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: experience, isLoading, isPending, error } = useLearningById(id);
  const updateExperience = useUpdateLearning();

  const handleSave = async (data: UpdateLearning) => {
    await updateExperience.mutateAsync({
      id,
      data,
    });
    router.push("/admin/learning");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Error Loading Learning</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Learning Not Found</h1>
        <p className="text-muted-foreground">
          The learning you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit {experience.year}</h1>
        <p className="text-muted-foreground">Update your learning experience</p>
      </div>
      <LearningEditor
        experience={experience}
        onSave={handleSave}
        isLoading={isPending}
      />
    </div>
  );
}
