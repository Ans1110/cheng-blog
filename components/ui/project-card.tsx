"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ExternalLink, FolderGit2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { Button } from "./button";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ProjectCardProps {
  project: Project;
  className?: string;
}

function ProjectCard({ project, className }: ProjectCardProps) {
  const cardContent = (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border border-border/50 h-full",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-64 bg-[#F2F2F2] dark:bg-muted/30 overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                <ExternalLink className="w-8 h-8" />
              </div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bg-[#171717] dark:bg-card p-6 space-y-4">
        <h3 className="text-2xl font-bold text-white dark:text-foreground">
          {project.title}
        </h3>
        <p className="text-[#AAAAAA] dark:text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-[#4CAF50] text-white hover:bg-[#4CAF50]/90"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 pt-2">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                className="bg-[#00C9A7] hover:bg-[#00C9A7]/90 text-white flex items-center gap-2"
              >
                View Code
                <FolderGit2 className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div variants={itemVariants}>
      {project.projectUrl ? (
        <Link
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}

export { ProjectCard, itemVariants };
