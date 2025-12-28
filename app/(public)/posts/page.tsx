"use client";

import { PostsPageClient } from "@/components/posts";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export default function PostsPage() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-destructive">Error loading posts</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return <PostsPageClient posts={posts || []} />;
}
