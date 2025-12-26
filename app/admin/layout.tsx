"use client";

import ThemeToggle from "@/components/ui/theme-toggle";
import useAdminAuth from "@/hooks/useAdminAuth";
import {
  BookOpen,
  Brain,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Tags,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/notes", label: "Notes", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/projects", label: "Projects", icon: Folder },
  { href: "/admin/learning", label: "Learning", icon: Brain },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAdminAuth(
    pathname !== "/admin/login"
  );

  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="flex-1 p-8 overflow-auto bg-background">
        <Loader2 className="size-4 mr-2 animate-spin" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // hook will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            Admin
          </Link>
          <ThemeToggle />
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all",
                  pathname === link.href &&
                    "bg-primary/10 text-primary font-medium"
                )}
              >
                <link.icon className="size-4 mr-2" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-4 space-y-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-muted"
            >
              <Home className="size-4 mr-2" />
              View Site
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-background">{children}</main>
    </div>
  );
}
