"use client";

import { PostContent } from "@/components/posts";
import { usePostBySlug } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";

export default function PostClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: post, isLoading, error } = usePostBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error || !post || !post.published) {
    notFound();
  }

  return <PostContent post={post} />;
}
