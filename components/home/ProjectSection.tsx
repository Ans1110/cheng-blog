"use client";

import { useProjects } from "@/hooks/useProjects";
import { SectionHeader } from "../ui/section-header";
import { ProjectList } from "./ProjectsList";
import { ProjectListSkeleton } from "../ui/project-card-skeleton";

export const ProjectSection = () => {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <section className="container py-20 md:py-28">
      <SectionHeader title="Projects" />
      {isLoading ? (
        <ProjectListSkeleton count={4} />
      ) : error ? (
        <p className="text-center py-10 text-destructive">Couldn&rsquo;t load projects: {error.message}</p>
      ) : (
        <ProjectList projects={projects || []} />
      )}
    </section>
  );
};
