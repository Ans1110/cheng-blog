import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex gap-4">
      <Link href="/admin/posts/new">
        <Button size="lg" className="hover:scale-105 transition-transform">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </Link>
      <Link href="/admin/notes/new">
        <Button
          variant="outline"
          size="lg"
          className="hover:scale-105 transition-transform"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </Link>
    </div>
  );
}
