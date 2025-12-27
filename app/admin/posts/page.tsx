"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePost, usePosts } from "@/hooks/usePosts";
import { format } from "date-fns";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPostsPage() {
  const { data: posts, isLoading } = usePosts();
  const deletePost = useDeletePost();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deletePost.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success("Post deleted successfully");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Posts
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your blog posts
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 size-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No posts yet. Create your first post!
          </p>
          <Link href="/admin/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(post.tags?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(post.tags?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {post.published && (
                        <Link href={`/posts/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="size-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(post.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
