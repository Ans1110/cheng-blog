"use client";

import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { ProjectCard } from "../ui/project-card";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

interface ProjectsListProps {
  projects: Project[];
}

const ProjectList = ({ projects }: ProjectsListProps) => {
  if (projects.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No projects yet.</p>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid md:grid-cols-2 gap-6"
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </motion.div>
  );
};

export default ProjectList;
export { ProjectList };
