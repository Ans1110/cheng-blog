"use client";

import { NoteCategory } from "@/types/category";
import { Note } from "@/types/note";
import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { PageHeader, SearchField, TagChip } from "../dream/PageParts";
import { trackSpotlight } from "../dream/spotlight";
import { ArrowLeft, ArrowUpRight, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { Pagination } from "../ui/pagination";

const ITEMS_PER_PAGE = 10;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
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
  const [currentPage, setCurrentPage] = useState(1);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedTag(null);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Tags used inside the open category; they filter that category's notes.
  const categoryTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes
      .filter((note) => note.category === selectedCategory)
      .forEach((note) => note.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes, selectedCategory]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter((note) => {
      const matchesCategory = !selectedCategory || note.category === selectedCategory;
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

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotes, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const noteList = (
    <>
      <motion.div
        key={`${selectedCategory}-${selectedTag}-${currentPage}-${searchQuery}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-3 max-w-3xl mx-auto"
      >
        {paginatedNotes.map((note) => (
          <NoteRow key={note.id} note={note} />
        ))}
      </motion.div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-12"
      />
    </>
  );

  const empty = <p className="text-center text-muted-foreground py-20">Nothing matches that.</p>;

  // ===== Index view (no category/tag selected) =====
  if (!selectedCategory && !selectedTag) {
    return (
      <div className="container pb-16 min-h-screen">
        <PageHeader title="Notes" meta={`${notes.length} notes · ${categories.length} topics`} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto space-y-5 mb-10"
        >
          <SearchField
            id="note-search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search notes…"
          />
        </motion.div>

        {searchQuery ? (
          filteredNotes.length === 0 ? empty : noteList
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0;
              const disabled = count === 0;
              return (
                <motion.button
                  key={category.id}
                  variants={itemVariants}
                  onClick={() => !disabled && handleCategorySelect(category.id)}
                  onMouseMove={trackSpotlight}
                  disabled={disabled}
                  className={cn(
                    "group holo glass rounded-3xl p-6 text-left flex flex-col min-h-40 transition-transform duration-500",
                    disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-1",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-3xl leading-tight tracking-tight group-hover:text-[var(--glow)] transition-colors">
                      {category.name}
                    </h3>
                    <span className="pill shrink-0">{count}</span>
                  </div>
                  {category.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                  )}
                  <ArrowUpRight className="mt-auto translate-y-1 size-5 self-end text-muted-foreground transition-all duration-300 group-hover:text-[var(--glow)] group-hover:rotate-45" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  // ===== Filtered (category / tag) view =====
  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const heading = selectedCategory ? activeCategory?.name || selectedCategory : `#${selectedTag}`;

  return (
    <div className="container pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto pt-8">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          All notes
        </button>
      </div>

      <PageHeader title={heading} meta={`${filteredNotes.length} notes`} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto space-y-4 mb-10"
      >
        {activeCategory?.description && (
          <p className="text-center text-muted-foreground">{activeCategory.description}</p>
        )}
        <SearchField
          id="note-search-in"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search here…"
        />
        {selectedCategory && categoryTags.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {categoryTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <TagChip
                  key={tag}
                  label={tag}
                  active={active}
                  onClick={() => handleTagSelect(active ? null : tag)}
                >
                  {active && <X className="size-3.5" />}
                </TagChip>
              );
            })}
          </div>
        ) : (
          selectedTag && (
            <div className="flex justify-center">
              <TagChip label={selectedTag} active onClick={() => handleTagSelect(null)}>
                <X className="size-3.5" />
              </TagChip>
            </div>
          )
        )}
      </motion.div>

      {filteredNotes.length === 0 ? empty : noteList}
    </div>
  );
};

function NoteRow({ note }: { note: Note }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/notes/${note.slug}`}
        onMouseMove={trackSpotlight}
        className="group holo glass rounded-2xl px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 transition-transform duration-300 hover:translate-x-1"
      >
        <time dateTime={new Date(note.createdAt).toISOString()} className="eyebrow shrink-0 sm:w-28">
          {format(new Date(note.createdAt), "MMM d, yyyy")}
        </time>
        <h3 className="flex-1 min-w-0 font-semibold text-lg leading-snug group-hover:text-[var(--glow)] transition-colors">
          {note.title}
          {note.pdfUrl && (
            <span className="ml-2 inline-flex translate-y-[-2px] items-center gap-1 rounded-full border border-[var(--glass-border)] px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="size-3" /> PDF
            </span>
          )}
        </h3>
        {note.tags && note.tags.length > 0 && (
          <div className="hidden md:flex gap-1.5 shrink-0">
            {note.tags.slice(0, 2).map((t) => (
              <span key={t} className="pill">{t}</span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
