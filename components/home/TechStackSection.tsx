"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const techStack = [
  { name: "JavaScript", icon: "/javascript.svg", color: "#F7DF1E" },
  { name: "TypeScript", icon: "/typescript.svg", color: "#3178C6" },
  { name: "React", icon: "/react.svg", color: "#61DAFB" },
  { name: "Next.js", icon: "/nextdotjs.svg", color: "#000000" },
  { name: "Tailwind CSS", icon: "/tailwindcss.svg", color: "#06B6D4" },
  { name: "Redux", icon: "/redux.svg", color: "#764ABC" },
  { name: "Zustand", icon: "/zustand.svg", color: "#443F3F" },
  { name: "React Query", icon: "/reactquery.svg", color: "#FF4154" },
  { name: "React Hook Form", icon: "/reacthookform.svg", color: "#EC5990" },
  { name: "Node.js", icon: "/nodedotjs.svg", color: "#5FA04E" },
  { name: "Hono", icon: "/hono.svg", color: "#E36002" },
  { name: "Drizzle", icon: "/drizzle.svg", color: "#C5F74F" },
  { name: "Go", icon: "/go.svg", color: "#00ADD8" },
  { name: "Gin", icon: "/gin.svg", color: "#00ADD8" },
  { name: "PostgreSQL", icon: "/postgresql.svg", color: "#4169E1" },
  { name: "Git", icon: "/git.svg", color: "#F05032" },
  { name: "Docker", icon: "/docker.svg", color: "#2496ED" },
  { name: "Linux", icon: "/linux.svg", color: "#FCC624" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const handleMouseEnter = (
  iconRef: React.RefObject<HTMLDivElement | null>,
  color: string
) => {
  if (iconRef.current) {
    iconRef.current.style.borderBottomColor = color;
  }
};

const handleMouseLeave = (iconRef: React.RefObject<HTMLDivElement | null>) => {
  if (iconRef.current) {
    iconRef.current.style.borderBottomColor = "transparent";
  }
};

interface TechStackSectionProps {
  tech: (typeof techStack)[number];
  variant: typeof itemVariants;
}

const TechStackItem = ({ tech, variant }: TechStackSectionProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      variants={variant}
      className="flex flex-col items-center gap-2 group"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => handleMouseEnter(iconRef, tech.color)}
      onMouseLeave={() => handleMouseLeave(iconRef)}
    >
      <div
        ref={iconRef}
        className="size-12 md:size-14 flex items-center justify-center rounded-lg bg-card border border-border shadow-sm group-hover:shadow-md transition-all duration-300 p-2 dark:backdrop-blur-xl"
        style={{
          borderBottom: "3px solid transparent",
          transitionProperty: "border-color, box-shadow",
        }}
      >
        <Image
          src={tech.icon}
          alt={tech.name}
          width={40}
          height={40}
          className="size-8 md:size-10 object-contain"
        />
      </div>
      <span className="text-xs text-muted-foreground text-center hidden sm:block cursor-default">
        {tech.name}
      </span>
    </motion.div>
  );
};

export const TechStackSection = () => {
  return (
    <section className="py-40 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Tech Stack
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-6 md:grid-cols-9 gap-6 max-w-6xl mx-auto"
        >
          {techStack.map((tech) => (
            <TechStackItem key={tech.name} tech={tech} variant={itemVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
