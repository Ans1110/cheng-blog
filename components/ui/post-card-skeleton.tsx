import { cn } from "@/lib/utils";

function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-3xl p-6 md:p-8 space-y-4", className)}>
      <div className="h-3 w-24 rounded-full dream-shimmer" />
      <div className="h-9 w-3/4 rounded-xl dream-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full dream-shimmer" />
        <div className="h-4 w-5/6 rounded-full dream-shimmer" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full dream-shimmer" />
        <div className="h-6 w-20 rounded-full dream-shimmer" />
      </div>
    </div>
  );
}

function PostListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 max-w-3xl mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { PostCardSkeleton, PostListSkeleton };
