import { cn } from "@/lib/utils";

function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-3xl overflow-hidden", className)}>
      <div className="aspect-[16/10] dream-shimmer" />
      <div className="p-6 md:p-7 space-y-3">
        <div className="h-8 w-2/3 rounded-xl dream-shimmer" />
        <div className="h-4 w-full rounded-full dream-shimmer" />
        <div className="h-4 w-4/5 rounded-full dream-shimmer" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 rounded-full dream-shimmer" />
          <div className="h-6 w-14 rounded-full dream-shimmer" />
        </div>
      </div>
    </div>
  );
}

function ProjectListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { ProjectCardSkeleton, ProjectListSkeleton };
