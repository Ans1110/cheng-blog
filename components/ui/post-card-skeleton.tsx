import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PostCardSkeletonProps {
  className?: string;
}

function PostCardSkeleton({ className }: PostCardSkeletonProps) {
  return (
    <Card className={cn("h-full border-border/50", className)}>
      <CardHeader className="space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-5 w-2/3 bg-muted/50 rounded animate-pulse" />
        </div>
        {/* Date Skeleton */}
        <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Excerpt Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
        </div>
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-5 w-14 bg-muted/40 rounded-md animate-pulse" />
          <div className="h-5 w-16 bg-muted/40 rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

interface PostListSkeletonProps {
  count?: number;
}

function PostListSkeleton({ count = 6 }: PostListSkeletonProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { PostCardSkeleton, PostListSkeleton };
