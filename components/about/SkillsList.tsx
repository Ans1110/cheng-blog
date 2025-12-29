"use client";

import { motion } from "framer-motion";

interface SkillsListProps {
  skills?: string[] | null;
}

export const SkillsList = ({ skills }: SkillsListProps) => {
  const skillsList = skills ?? [];

  if (skillsList.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills added yet</p>;
  }

  return (
    <ul className="space-y-1.5">
      {skillsList.map((skill, i) => (
        <motion.li
          key={skill}
          className="flex items-center gap-2 text-sm text-muted-foreground cursor-default"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{
            x: 8,
            color: "var(--foreground)",
            transition: { duration: 0.2 },
          }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
            whileHover={{ scale: 1.5 }}
          />
          <span>{skill}</span>
        </motion.li>
      ))}
    </ul>
  );
};
