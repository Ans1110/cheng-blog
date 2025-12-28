"use client";

import { Post } from "@/types/post";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import MarkdownRenderer from "../markdown/MarkDownRenderer";

interface PostContentProps {
  post: Post;
}

export const PostContent = ({ post }: PostContentProps) => {
  return (
    <article className="container max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <ArrowLeft className="size-4 mr-2" />
            Back to Posts
          </Button>
        </Link>
      </div>

      <header className="mb-10 space-y-4 pb-8 border-b">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <time dateTime={new Date(post.createdAt).toISOString()} className="text-sm">
            {format(new Date(post.createdAt), "MMMM d, yyyy")}
          </time>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
};
