"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import type { Post } from "@/types/post";
import { PostCard } from "../ui/post-card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface LatestPostsListProps {
  posts: Post[];
}

const LatestPostsList = ({ posts }: LatestPostsListProps) => {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No posts yet. Check back soon!
      </p>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-10"
      >
        <Link href="/posts">
          <Button variant="outline" className="group">
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>
    </>
  );
};

export { LatestPostsList };
