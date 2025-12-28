"use client";

import { Post } from "@/types/post";
import { Variants } from "framer-motion";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { format } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

interface PostsPageClientProps {
  posts: Post[];
}

export const PostsPageClient = ({ posts }: PostsPageClientProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []) || [])
  ).sort();

  const filteredPosts = posts?.filter((post) => {
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="container py-12 space-y-10">
      {/* Header */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Posts
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse all posts and filter by tags
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative">
          <Input
            placeholder="Search posts by title or excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md h-11 text-base"
          />
        </div>

        {allTags.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <Badge
              variant={!selectedTag ? "default" : "outline"}
              onClick={() => setSelectedTag(null)}
              className="cursor-pointer transition-all hover:scale-105 px-4 py-1.5"
            >
              All
            </Badge>
            {allTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.03 }}
              >
                <Badge
                  variant={selectedTag === tag ? "default" : "outline"}
                  onClick={() => setSelectedTag(tag)}
                  className="cursor-pointer transition-all hover:scale-105 px-4 py-1.5"
                >
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Posts Grid */}
      {filteredPosts?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg">No posts found.</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="gird gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredPosts?.map((post, index) => (
            <motion.div key={post.id} variants={itemVariants} custom={index}>
              <Link href={`/posts/${post.slug}`}>
                <Card className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50 group">
                  <CardHeader className="space-y-3">
                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.excerpt && (
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
