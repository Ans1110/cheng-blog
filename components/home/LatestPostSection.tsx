"use client";

import { usePosts } from "@/hooks/usePosts";
import { SectionHeader } from "../ui/section-header";
import { PostListSkeleton } from "../ui/post-card-skeleton";
import { LatestPostsList } from "./PostList";

export const LatestPostSection = () => {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
      <SectionHeader title="Latest posts" href="/posts" />
      {isLoading ? (
        <PostListSkeleton count={3} />
      ) : error ? (
        <p className="text-center py-10 text-destructive">Couldn&rsquo;t load posts: {error.message}</p>
      ) : (
        <LatestPostsList posts={posts || []} />
      )}
      </div>
    </section>
  );
};
