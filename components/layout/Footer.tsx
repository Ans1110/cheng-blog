"use client";

import { Github, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
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

          {/* Logo/Brand */}
          <div className="flex flex-col items-center">
            <Link href="/" className="inline-block">
              <Image
                src="/logo_gold.svg"
                alt="Logo"
                width={60}
                height={60}
                className="w-25 h-16"
              />
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Building things, one line at a time
            </p>
            <p className="text-sm mt-2">Web Developer</p>
          </div>

          {/* Social & Contact */}
          <div className="md:text-right">
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex md:justify-end space-x-4">
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

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Cheng. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
