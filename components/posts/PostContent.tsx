"use client";

import { Post } from "@/types/post";
import { format } from "date-fns";
import { ArticleShell } from "../dream/ArticleShell";

interface PostContentProps {
  post: Post;
}

export const PostContent = ({ post }: PostContentProps) => {
  const date = format(new Date(post.createdAt), "MMMM d, yyyy");
  const minutes = Math.max(1, Math.round(post.content.split(/\s+/).length / 220));

  return (
    <ArticleShell
      backHref="/posts"
      backLabel="All posts"
      title={post.title}
      meta={
        <>
          <time dateTime={new Date(post.createdAt).toISOString()}>{date}</time> · {minutes} min read
        </>
      }
      lede={post.excerpt}
      tags={post.tags}
      content={post.content}
    />
  );
};
