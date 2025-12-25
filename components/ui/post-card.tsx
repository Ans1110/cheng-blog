"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Post } from "@/types/post";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PostCardProps {
  post: Post;
  className?: string;
}

function PostCard({ post, className }: PostCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/posts/${post.slug}`}>
        <Card
          className={cn(
            "h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50 group",
            className
          )}
        >
          <CardHeader className="space-y-3">
            <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
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
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export { PostCard };
