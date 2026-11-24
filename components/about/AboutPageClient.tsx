"use client";

import { Learning } from "@/types/learning";
import { motion, type Variants } from "framer-motion";
import { useInterests } from "@/hooks/useInterests";
import { ArrowUpRight, Github, Instagram, Mail } from "lucide-react";
import { LearningTimeLine } from "./LearningTimeLine";
import { PageHeader } from "../dream/PageParts";
import { SectionHeader } from "../ui/section-header";

const bubbleColors = [
  "var(--dream-pink)",
  "var(--dream-lilac)",
  "var(--dream-blue)",
  "var(--dream-mint)",
  "var(--dream-butter)",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const links = [
  {
    href: "https://www.instagram.com/pizza.__11.10/",
    label: "Instagram",
    icon: Instagram,
    external: true,
  },
  {
    href: "https://github.com/Ans1110",
    label: "GitHub",
    icon: Github,
    external: true,
  },
  {
    href: "mailto:bo99645bo@gmail.com",
    label: "Email",
    icon: Mail,
    external: false,
  },
];

interface AboutPageClientProps {
  data: Learning[];
}

export const AboutPageClient = ({ data }: AboutPageClientProps) => {
  const { data: interests = [] } = useInterests();

  return (
    <div className="container pb-16">
      <PageHeader title="About" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid md:grid-cols-5 gap-5 max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="md:col-span-3 glass rounded-3xl p-7 md:p-9"
        >
          <p className="text-lg md:text-xl leading-relaxed">
            Hi, I&rsquo;m{" "}
            <span className="font-display italic text-3xl text-dream">
              Cheng
            </span>
            . I created this website to collect moments of my everyday life,
            memories of the things and people I love, and thoughts from my
            learning journey. From daily experiences and fan life to technical
            articles and study notes, this little space is a reflection of who I
            am — and a way to understand myself a little better along the way.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="md:col-span-2 glass rounded-3xl p-7 md:p-9"
        >
          <p className="eyebrow mb-4">Links</p>
          <ul className="space-y-2">
            {links.map(({ href, label, icon: Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 -mx-3 font-semibold transition-colors hover:bg-[color-mix(in_oklch,var(--dream-lilac)_16%,transparent)]"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--dream-lilac)_22%,transparent)]">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1">{label}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Interests — floating bubbles */}
      {interests.length > 0 && (
        <section className="mt-24 md:mt-32 max-w-4xl mx-auto">
          <SectionHeader title="Interests" />
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-3 md:gap-4"
          >
            {interests.map(({ id, name: tag }, i) => {
              const color = bubbleColors[i % bubbleColors.length];
              return (
                <motion.li key={id} variants={fadeUp}>
                  {/* CSS float (compositor-only) and no per-bubble backdrop blur: both were heavy on phones */}
                  <span
                    className="animate-float inline-block rounded-full px-5 py-2 font-semibold cursor-default select-none transition-transform duration-300 hover:scale-110"
                    style={{
                      animationDuration: `${3 + (i % 4) * 0.7}s`,
                      animationDelay: `${-(i * 0.25)}s`,
                      background: `color-mix(in oklch, ${color} 28%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${color} 60%, transparent)`,
                      boxShadow: `0 8px 24px -10px ${color}, inset 0 1px 0 oklch(1 0 0 / 0.4)`,
                    }}
                  >
                    {tag}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        </section>
      )}

      <section className="mt-24 md:mt-32 max-w-4xl mx-auto">
        <LearningTimeLine data={data} />
      </section>
    </div>
  );
};
