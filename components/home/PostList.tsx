"use client";

import { motion } from "framer-motion";
import type { Post } from "@/types/post";
import { PostCard } from "../ui/post-card";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface LatestPostsListProps {
  posts: Post[];
}

const LatestPostsList = ({ posts }: LatestPostsListProps) => {
  if (posts.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No posts yet.</p>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid gap-5 max-w-3xl mx-auto"
    >
      {posts.slice(0, 4).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </motion.div>
  );
};

export { LatestPostsList };
