"use client";

import { Github, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/notes", label: "Notes" },
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
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        {/* Mobile: Logo first, then links in row */}
        {/* Desktop: 3 columns */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
          {/* Logo/Brand - First on mobile, center on desktop */}
          <div className="flex flex-col items-center order-first md:order-0 md:col-start-2">
            <Link href="/" className="inline-block" onClick={handleLogoClick}>
              <Image
                src="/logo_gold.svg"
                alt="Logo"
                width={60}
                height={60}
                className="w-25 h-16"
              />
            </Link>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Building things, one line at a time
            </p>
            <p className="text-sm mt-2">Web Developer</p>
          </div>

          {/* Quick Links & Connect - Side by side on mobile */}
          <div className="flex flex-row justify-between md:contents">
            {/* Quick Links */}
            <div className="md:order-first md:col-start-1 md:row-start-1">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
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
            </div>

            {/* Social & Contact */}
            <div className="text-right md:col-start-3 md:row-start-1">
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex justify-end space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm mt-4 inline-block"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Cheng. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
