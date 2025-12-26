"use client";

import ProjectEditor from "@/components/admin/ProjectEditor";
import { useCreateProject } from "@/hooks/useProjects";
import { CreateProjectInput } from "@/utils/validation";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSave = async (data: CreateProjectInput) => {
    await createProject.mutateAsync({ ...data, tags: data.tags || [] });
    router.push("/admin/projects");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-muted-foreground">Create a new project</p>
      </div>
      <ProjectEditor onSave={handleSave} />
    </div>
  );
}
