import { cn } from "@/lib/utils";

interface ProjectCardSkeletonProps {
  className?: string;
}

function ProjectCardSkeleton({ className }: ProjectCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-lg bg-card border border-border/50 h-full",
        className
      )}
    >
      {/* Image Section Skeleton */}
      <div className="relative h-64 bg-[#F2F2F2] dark:bg-muted/30 animate-pulse" />

      {/* Content Section Skeleton */}
      <div className="bg-[#171717] dark:bg-card p-6 space-y-4">
        {/* Title Skeleton */}
        <div className="h-8 w-3/4 bg-muted/50 rounded animate-pulse" />

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-muted/40 rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-muted/40 rounded-md animate-pulse" />
          <div className="h-6 w-14 bg-muted/40 rounded-md animate-pulse" />
        </div>

        {/* Button Skeleton */}
        <div className="pt-2">
          <div className="h-8 w-28 bg-muted/40 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface ProjectListSkeletonProps {
  count?: number;
}

function ProjectListSkeleton({ count = 6 }: ProjectListSkeletonProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { ProjectCardSkeleton, ProjectListSkeleton };
