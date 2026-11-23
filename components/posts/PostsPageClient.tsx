"use client";

import { Post } from "@/types/post";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, SearchField, TagChip } from "../dream/PageParts";
import { PostCard } from "../ui/post-card";
import { Pagination } from "../ui/pagination";

const ITEMS_PER_PAGE = 10;

interface PostsPageClientProps {
  posts: Post[];
}

export const PostsPageClient = ({ posts }: PostsPageClientProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    posts.forEach((post) => post.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [posts, selectedTag, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container pb-16 min-h-screen">
      <PageHeader title="Posts" meta={`${filteredPosts.length} ${filteredPosts.length === 1 ? "post" : "posts"}`} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto space-y-5 mb-10"
      >
        <SearchField
          id="post-search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search posts…"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <TagChip label="All" active={!selectedTag} onClick={() => handleTagSelect(null)} />
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                active={selectedTag === tag}
                onClick={() => handleTagSelect(tag)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {filteredPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Nothing matches that.</p>
      ) : (
        <>
          <motion.div
            key={`${selectedTag}-${searchQuery}-${currentPage}`}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid gap-5 max-w-3xl mx-auto"
          >
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        </>
      )}
    </div>
  );
};
