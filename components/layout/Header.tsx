"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "../ui/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
];

const menuVariants = {
  closed: {
    x: "100%",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

const containerVariants = {
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  closed: {
    x: 50,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

export const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <Image
              src="/logo_gold.svg"
              alt="Logo"
              width={60}
              height={60}
              className="w-25 h-16"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 relative",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-foreground/60"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Animated Hamburger Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 bg-foreground rounded-full origin-center"
                animate={
                  mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.span
                className="w-full h-0.5 bg-foreground rounded-full"
                animate={
                  mobileMenuOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-full h-0.5 bg-foreground rounded-full origin-center"
                animate={
                  mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-16 right-0 bottom-0 w-2/3 max-w-64 bg-background/70 backdrop-blur-xl border-l border-border/50 shadow-xl md:hidden z-50"
            >
              <motion.nav
                variants={containerVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex flex-col p-4 pt-6 space-y-1 bg-background/60 backdrop-blur-xl border-l border-border/50 rounded-bl-2xl"
              >
                {navItems.map((item) => (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground hover:translate-x-1"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
