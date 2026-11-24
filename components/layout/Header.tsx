"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "../ui/theme-toggle";
import { MaskImage } from "../dream/MaskImage";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const recordCategories = [
  { href: "/record/daily", label: "Daily" },
  { href: "/record/film", label: "Film Review" },
  { href: "/record/kpop", label: "K-pop" },
];

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/notes", label: "Notes" },
  { href: "/record", label: "Record", children: recordCategories },
  { href: "/about", label: "About" },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const isHomePage = pathname === "/";

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Always mounted and driven by CSS transitions rather than an exit animation:
  // the open state flips instantly, so a closing menu can never trap taps or
  // stall on a slow phone.
  const mobileMenu = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!mobileMenuOpen}
      inert={!mobileMenuOpen}
      className={cn(
        "fixed inset-0 z-[60] md:hidden bg-background/85 backdrop-blur-xl flex flex-col items-center justify-center transition-[opacity,visibility] duration-300",
        mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      <nav className="flex flex-col items-center gap-3">
        {navItems.map((item, i) => {
          const active = isActive(pathname, item.href);
          return (
            <div
              key={item.href}
              className={cn(
                "transition-[opacity,transform] duration-300 ease-out",
                mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              style={{ transitionDelay: mobileMenuOpen ? `${50 * i + 50}ms` : "0ms" }}
            >
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-display text-5xl italic px-4 py-1 block",
                  active ? "text-dream" : "text-foreground/60",
                )}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex justify-center gap-4 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        pathname.startsWith(child.href)
                          ? "text-dream"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Scroll progress — an iridescent thread across the top */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-[linear-gradient(90deg,var(--dream-pink),var(--dream-lilac),var(--dream-blue),var(--dream-mint))]"
        style={{ scaleX: progress }}
      />

      {/* Above the menu overlay while it is open, so the toggle button stays tappable */}
      <header className={cn("sticky top-0 w-full pt-3 md:pt-4 px-3", mobileMenuOpen ? "z-[65]" : "z-50")}>
        <div className="glass mx-auto max-w-5xl rounded-full flex h-14 items-center justify-between pl-5 pr-2">
          <Link
            href="/"
            className="flex items-center group"
            onClick={handleLogoClick}
            aria-label="Cheng's Blog — home"
          >
            <MaskImage
              src="/logo_gold.svg"
              className="w-[72px] h-11 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-haspopup={item.children ? "true" : undefined}
                  aria-expanded={item.children ? openSubmenu === item.href : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-full bg-[color-mix(in_oklch,var(--dream-lilac)_22%,transparent)] shadow-[0_0_20px_-4px_var(--dream-lilac)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                  {item.children && (
                    <ChevronDown className={cn("relative size-3.5 transition-transform duration-300", openSubmenu === item.href && "rotate-180")} />
                  )}
                </Link>
              );

              if (!item.children) return link;

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(item.href)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                  onFocus={() => setOpenSubmenu(item.href)}
                  onBlur={(e) => {
                    // Close only when focus leaves the whole menu, not when tabbing between its links.
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpenSubmenu(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpenSubmenu(null);
                  }}
                >
                  {link}
                  {/* pt-3 bridges the gap so the menu stays open while the cursor travels down */}
                  <div
                    className={cn(
                      "transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-3",
                      openSubmenu === item.href
                        ? "visible opacity-100 translate-y-0"
                        : "invisible opacity-0 translate-y-1 pointer-events-none",
                    )}
                  >
                    <div className="glass rounded-full p-1 flex flex-row items-center gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenSubmenu(null)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                            pathname.startsWith(child.href)
                              ? "text-foreground bg-[color-mix(in_oklch,var(--dream-lilac)_22%,transparent)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_oklch,var(--dream-lilac)_14%,transparent)]",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              className="md:hidden relative z-[80] size-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-3.5 relative flex flex-col justify-between">
                <motion.span
                  className="w-full h-0.5 rounded-full bg-foreground origin-center"
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-full h-0.5 rounded-full bg-foreground"
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-full h-0.5 rounded-full bg-foreground origin-center"
                  animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(mobileMenu, document.body)}
    </>
  );
};
