"use client";

import { usePosts } from "@/hooks/usePosts";
import { SectionHeader } from "../ui/section-header";
import { PostListSkeleton } from "../ui/post-card-skeleton";
import { LatestPostsList } from "./PostList";

export const LatestPostSection = () => {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <SectionHeader
          title="Latest Posts"
          description="Recent articles from the blog"
        />
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-lg text-destructive">Error loading posts</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : (
          <LatestPostsList posts={posts || []} />
        )}
      </div>
    </section>
  );
};
