import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";

interface RecentPostsListProps {
  posts: Post[];
  isLoading?: boolean;
}

export function RecentPostsList({ posts, isLoading }: RecentPostsListProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Recent Posts</CardTitle>
        <CardDescription>The latest blog posts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                    {!post.published && (
                      <span className="ml-2 text-yellow-600">(Draft)</span>
                    )}
                  </p>
                </div>
                <Link href={`/admin/posts/${post.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
