"use client";

import { useProjectById, useUpdateProject } from "@/hooks/useProjects";
import { UpdateProjectInput } from "@/utils/validation";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default function EditProjectClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const updateProject = useUpdateProject();
  const {
    data: project,
    isLoading,
    isPending,
    error,
  } = useProjectById(Number(id));

  const handleSave = async (data: UpdateProjectInput) => {
    await updateProject.mutateAsync({
      id: Number(id),
      data: { ...data, tags: data.tags || [] },
    });
    router.push("/admin/projects");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground">Update your project</p>
      </div>
      <ProjectEditor
        project={project}
        onSave={handleSave}
        isLoading={isPending}
      />
    </div>
  );
}
