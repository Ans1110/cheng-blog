"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { trackSpotlight } from "../dream/spotlight";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

interface ProjectCardProps {
  project: Project;
  className?: string;
}

function ProjectCard({ project, className }: ProjectCardProps) {
  // Gentle 3D tilt that follows the pointer
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    trackSpotlight(e);
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div variants={itemVariants} style={{ perspective: 1000 }} className="h-full">
      <motion.article
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("group holo glass relative h-full rounded-3xl overflow-hidden flex flex-col", className)}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover saturate-[0.85] transition-all duration-700 group-hover:scale-105 group-hover:saturate-110"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--dream-pink),var(--dream-lilac),var(--dream-blue))] opacity-60" />
          )}
          {/* Dreamy haze over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--glass-bg)] via-transparent to-[color-mix(in_oklch,var(--dream-lilac)_18%,transparent)] mix-blend-normal" />
        </div>

        <div className="flex-1 flex flex-col p-6 md:p-7">
          <h3 className="font-display text-3xl md:text-[2.1rem] leading-tight tracking-tight">
            {project.projectUrl ? (
              <Link
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="after:absolute after:inset-0 after:content-[''] after:z-[2] group-hover:text-[var(--glow)] transition-colors"
              >
                {project.title}
                <ArrowUpRight className="inline-block ml-1 size-5 align-middle transition-transform duration-300 group-hover:rotate-45" />
              </Link>
            ) : (
              project.title
            )}
          </h3>

          <p className="mt-2 text-muted-foreground leading-relaxed line-clamp-3">{project.description}</p>

          <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
            {project.tags?.map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source on GitHub`}
                className="relative z-[3] ml-auto size-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-4" />
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export { ProjectCard, itemVariants };
