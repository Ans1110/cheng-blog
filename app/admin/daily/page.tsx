"use client";

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
import { useDailyPosts, useDeleteDailyPost } from "@/hooks/useDaily";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDailyPage() {
  const { data: posts, isLoading } = useDailyPosts();
  const deletePost = useDeleteDailyPost();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deletePost.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Daily
          </h1>
          <p className="text-lg text-muted-foreground">Photo posts for Record → Daily</p>
        </div>
        <Link href="/admin/daily/new">
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-4 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No daily posts yet.</p>
          <Link href="/admin/daily/new">
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
                <TableHead className="w-20">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.images[0] && (
                      <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                        <Image src={post.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.images.length}</TableCell>
                  <TableCell>{format(new Date(post.createdAt), "yyyy-MM-dd")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/daily/${post.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
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
        open={deleteId !== null}
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
