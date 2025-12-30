"use client";

import { Learning } from "@/types/learning";
import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { SkillsList } from "./SkillsList";

interface LearningTimeLineProps {
  data: Learning[];
}

const timelineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const yearVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const LearningTimeLine = ({ data }: LearningTimeLineProps) => {
  const learningData = data && data.length > 0 ? data : [];

  if (learningData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No learning data available
      </p>
    );
  }

  return (
    <div className="relative">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold text-center mb-12"
      >
        Learning Journey
      </motion.h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={timelineVariants}
        className="relative"
      >
        {/* Vertical line - left on mobile, center on desktop */}
        <motion.div
          className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/20 via-primary to-primary/20 origin-top"
          variants={lineVariants}
        />

        {/* Timeline items */}
        {learningData.map((experience, index) => {
          const isRight = index % 2 === 0;
          return (
            <motion.div
              key={experience.year}
              variants={yearVariants}
              className="relative mb-12 last:mb-0"
            >
              {/* center dot */}
              <motion.div
                className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-20"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
              />

              {/*  Mobile layout */}
              <div className="md:hidden pl-8">
                <div className="mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {experience.year}
                  </span>
                  <span className="text-muted-foreground ml-3">
                    {experience.title}
                  </span>
                </div>
                <Card className="group border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30">
                  <CardContent className="p-4">
                    <SkillsList skills={experience.skills} />
                  </CardContent>
                </Card>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                {/* Left side */}
                <div className={`${isRight ? "text-right pr-8" : "pl-8"}`}>
                  {!isRight ? (
                    <Card className="group border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-primary group-hover:text-foreground transition-colors duration-300">
                            {experience.year}
                          </span>
                          <span className="text-muted-foreground group-hover:text-foreground/80 ml-3 transition-colors duration-300">
                            {experience.title}
                          </span>
                        </div>
                        <SkillsList skills={experience.skills} />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="pt-1">
                      <span className="text-3xl font-bold text-primary">
                        {experience.year}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {experience.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side */}
                <div className={`${isRight ? "pl-8" : "text-right pr-8"}`}>
                  {isRight ? (
                    <Card className="group border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-primary group-hover:text-foreground transition-colors duration-300">
                            {experience.year}
                          </span>
                          <span className="text-muted-foreground group-hover:text-foreground/80 ml-3 transition-colors duration-300">
                            {experience.title}
                          </span>
                        </div>
                        <SkillsList skills={experience.skills} />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="pt-1">
                      <span className="text-3xl font-bold text-primary">
                        {experience.year}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {experience.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
