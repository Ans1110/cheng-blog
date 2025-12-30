"use client";

import { NoteCategory } from "@/types/category";
import { Note } from "@/types/note";
import { Variants } from "framer-motion";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { ArrowLeft, ChevronRight, Search, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const folderVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

interface NotesPageClientProps {
  notes: Note[];
  categories: NoteCategory[];
  categoryCounts: Record<string, number>;
}

export const NotesPageClient = ({
  notes,
  categories,
  categoryCounts,
}: NotesPageClientProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allTags = useMemo(() => {
    if (!notes) return [];
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter((note) => {
      const matchesCategory =
        !selectedCategory || note.category === selectedCategory;
      const matchesTag = !selectedTag || note.tags?.includes(selectedTag);
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [notes, selectedCategory, selectedTag, searchQuery]);

  if (!selectedCategory && !selectedTag) {
    return (
      <div className="container py-12 space-y-10 h-screen">
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-lg text-muted-foreground">
            Technical notes and snippets organized by topic
          </p>
        </motion.div>

        <motion.div
          className="relative max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </motion.div>

        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              Filter by tag
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.03 }}
                >
                  <Badge
                    variant="outline"
                    onClick={() => setSelectedTag(tag)}
                    className="cursor-pointer transition-all hover:scale-105 px-3 py-1"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {searchQuery ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Search Results ({filteredNotes.length})
            </h3>
            {filteredNotes.length === 0 ? (
              <p className="text-muted-foreground">No notes found.</p>
            ) : (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <Link href={`/notes/${note.slug}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-lg">
                              {note.title}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-2">
                              <span className="text-xs">
                                {format(
                                  new Date(note.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {note.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardDescription>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <motion.div
            key="categories-grid"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0;
              return (
                <motion.div key={category.id} variants={folderVariants}>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-md group h-full border-border/50 hover:border-primary/30 min-h-[160px]",
                      count === 0 && "opacity-50 pointer-events-none"
                    )}
                    onClick={() =>
                      count > 0 && setSelectedCategory(category.id)
                    }
                  >
                    <CardHeader className="space-y-4 p-6">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-2xl font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="text-sm px-3 py-1"
                        >
                          {count}
                        </Badge>
                      </div>
                      <CardDescription className="text-base line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-10 h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-4"
      >
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedTag(null);
            setSearchQuery("");
          }}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to folders
        </button>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name ||
                selectedCategory
              : selectedTag
              ? `Tag: ${selectedTag}`
              : "Search Results"}
          </h1>
          <p className="text-muted-foreground">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)
                  ?.description || ""
              : `${filteredNotes.length} notes found`}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedTag && (
          <Badge
            variant="default"
            className="cursor-pointer self-start"
            onClick={() => setSelectedTag(null)}
          >
            {selectedTag} <X className="size-3 ml-1" />
          </Badge>
        )}
      </motion.div>

      {selectedCategory && allTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {allTags
            .filter((tag) =>
              notes?.some(
                (note) =>
                  note.category === selectedCategory && note.tags?.includes(tag)
              )
            )
            .map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="cursor-pointer transition-all hover:scale-105"
              >
                {tag}
              </Badge>
            ))}
        </motion.div>
      )}

      {filteredNotes.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-lg">
            No notes found. Try adjusting your search or filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={`notes-list-${selectedCategory}-${selectedTag}`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
          {filteredNotes.map((note) => (
            <motion.div key={note.id} variants={itemVariants}>
              <Link href={`/notes/${note.slug}`}>
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <span className="text-xs">
                            {format(new Date(note.createdAt), "MMM d, yyyy")}
                          </span>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
