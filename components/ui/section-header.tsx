"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </motion.div>
  );
};

export default SectionHeader;
export { SectionHeader };
