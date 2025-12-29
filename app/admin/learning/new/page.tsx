"use client";

import { LearningEditor } from "@/components/admin";
import { useCreateLearning } from "@/hooks/useLearning";
import { CreateLearning } from "@/types/learning";
import { useRouter } from "next/navigation";

export default function NewLearningPage() {
  const router = useRouter();
  const { mutateAsync: createLearning, isPending } = useCreateLearning();

  const handleSave = async (data: CreateLearning) => {
    await createLearning(data);
    router.push("/admin/learning");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Learning Year</h1>
        <p className="text-muted-foreground">
          Add a new year to your learning journey
        </p>
      </div>
      <LearningEditor onSave={handleSave} isLoading={isPending} />
    </div>
  );
}
