"use client";

import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaskImage } from "../dream/MaskImage";

const quickLinks = [
  { href: "/posts", label: "Posts" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
];

const socialLinks = [
  { href: "https://github.com/Ans1110", label: "GitHub", icon: Github },
  { href: "mailto:bo99645bo@gmail.com", label: "Email", icon: Mail },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative mt-16">
      <div className="h-px bg-[linear-gradient(90deg,transparent,var(--dream-lilac),var(--dream-pink),transparent)] opacity-70" />
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" onClick={handleLogoClick} aria-label="Cheng's Blog — home">
          <MaskImage src="/logo_gold.svg" className="w-20 h-12" />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="glass size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all"
            >
              <s.icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
      <p className="eyebrow text-center pb-8">© {currentYear} Cheng</p>
    </footer>
  );
};
