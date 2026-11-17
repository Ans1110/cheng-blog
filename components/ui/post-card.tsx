"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Post } from "@/types/post";
import { trackSpotlight } from "../dream/spotlight";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

interface PostCardProps {
  post: Post;
  className?: string;
}

function PostCard({ post, className }: PostCardProps) {
  const date = format(new Date(post.createdAt), "MMM d, yyyy");

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/posts/${post.slug}`}
        onMouseMove={trackSpotlight}
        className={cn(
          "group holo glass block rounded-3xl p-6 md:p-8 transition-transform duration-500 hover:-translate-y-1",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <time dateTime={new Date(post.createdAt).toISOString()} className="eyebrow">
            {date}
          </time>
          <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:text-[var(--glow)] group-hover:rotate-45" />
        </div>

        <h3 className="font-display text-3xl md:text-4xl leading-[1.05] tracking-tight transition-colors group-hover:text-[var(--glow)]">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
            {post.tags.length > 4 && <span className="pill">+{post.tags.length - 4}</span>}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export { PostCard };
