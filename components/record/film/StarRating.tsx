import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/** Read-only 5-star rating with half-star support. */
export function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0, 0.5 or 1
        return (
          <span key={i} className="relative inline-flex">
            <Star className="size-[1em] text-current opacity-25" />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="size-[1em] fill-current text-current" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
