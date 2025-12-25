"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export const HeroSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-b from-muted/50 to-background">
      {/* Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 w-full h-auto"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            className="text-muted/30"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="currentColor"
            className="text-muted/20"
            d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,224C672,203,768,181,864,186.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${
              isDark ? "text-white" : ""
            }`}
            style={
              isDark
                ? {
                    textShadow: `
                0 0 10px rgba(255, 255, 255, 0.3),
                0 0 20px rgba(255, 255, 255, 0.2),
                0 0 40px rgba(255, 255, 255, 0.1)
              `,
                  }
                : undefined
            }
          >
            Explore. Focus. Improve.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Some days waiting for light, some days learning to land.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/notes">
              <Button size="lg" className="min-w-[160px]">
                My Notes
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="min-w-[160px]">
                About Me
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
