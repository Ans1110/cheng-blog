"use client";

import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { NotesPanel } from "@/components/admin/NotesPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useCategories";
import { useNotes } from "@/hooks/useNotes";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Tab = "notes" | "categories";

function AdminNotes() {
  const router = useRouter();
  const pathname = usePathname();
  // The tab lives in the URL so category create/edit pages can return to it.
  const tab: Tab = useSearchParams().get("tab") === "categories" ? "categories" : "notes";
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();

  const setTab = (next: string) =>
    router.replace(next === "categories" ? `${pathname}?tab=categories` : pathname, { scroll: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-lg text-muted-foreground">Manage your notes and their categories</p>
        </div>
        <Link href={tab === "notes" ? "/admin/notes/new" : "/admin/categories/new"}>
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 size-4" />
            {tab === "notes" ? "New Note" : "New Category"}
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="notes">
            Notes{notes ? ` (${notes.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories{categories ? ` (${categories.length})` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="mt-6">
          <NotesPanel />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminNotesPage() {
  // useSearchParams needs a Suspense boundary in a client page.
  return (
    <Suspense>
      <AdminNotes />
    </Suspense>
  );
}
