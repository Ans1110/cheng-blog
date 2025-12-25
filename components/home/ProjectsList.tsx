"use client";

import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { ProjectCard } from "../ui/project-card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface ProjectsListProps {
  projects: Project[];
}

const ProjectList = ({ projects }: ProjectsListProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-lg text-muted-foreground">No projects yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </motion.div>
  );
};

export default ProjectList;
export { ProjectList };
