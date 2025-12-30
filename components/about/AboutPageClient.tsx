"use client";

import { Learning } from "@/types/learning";
import { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LearningTimeLine } from "./LearningTimeLine";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

interface AboutPageClientProps {
  data: Learning[];
}

export const AboutPageClient = ({ data }: AboutPageClientProps) => {
  return (
    <div className="container max-w-4xl py-12 space-y-10">
      {/*  Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          About Me
        </h1>
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        ></motion.p>
      </motion.div>

      {/*  Cards grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Hi! I&apos;m Cheng, enjoy exploring new technologies, solving
                everyday problems with code, and building things I genuinely
                enjoy. This blog is a place for me to share what I learn during
                development and some of my thoughts along the way.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4"></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-xl">
                What I&apos;m Working On
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="flex flex-wrap gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.3 },
                  },
                }}
              >
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-base text-muted-foreground cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>A second-year computer science student</span>
                  </li>
                  <li className="flex items-center gap-2 text-base text-muted-foreground cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>Learning Web3 technologies</span>
                  </li>
                  <li className="flex items-center gap-2 text-base text-muted-foreground cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>Hooked on Golang</span>
                  </li>
                </ul>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                If you&apos;d like to connect, discuss ideas, collaborate on a
                project, or simply talk about software development, feel free to
                reach out. You can find me on GitHub or send me an email.
                I&apos;m always open to meaningful conversations and knowledge
                sharing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/*  Learning timeline */}
      <LearningTimeLine data={data} />
    </div>
  );
};
