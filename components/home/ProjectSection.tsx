"use client";

import { useProjects } from "@/hooks/useProjects";
import { SectionHeader } from "../ui/section-header";
import { ProjectList } from "./ProjectsList";
import { ProjectListSkeleton } from "../ui/project-card-skeleton";

export const ProjectSection = () => {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <section className="py-40 bg-background">
      <div className="container px-4">
        <SectionHeader
          title="Projects"
          description="Side projects I've worked on"
        />
        {isLoading ? (
          <ProjectListSkeleton count={6} />
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-lg text-destructive">Error loading projects</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : (
          <ProjectList projects={projects || []} />
        )}
      </div>
    </section>
  );
};
