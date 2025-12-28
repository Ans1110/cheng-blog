"use client";

import { PostEditor } from "@/components/admin";
import { usePostBySlug, useUpdatePost } from "@/hooks/usePosts";
import { UpdatePost } from "@/types/post";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const updatePost = useUpdatePost();
  const { data: post, isLoading, isPending, error } = usePostBySlug(slug);

  const handleSave = async (data: UpdatePost) => {
    if (!post) return;
    await updatePost.mutateAsync({
      id: post.id,
      data: { ...data, tags: data.tags || [] },
    });
    router.push("/admin/posts");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-muted-foreground">
          The post you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">Update your post</p>
      </div>
      <PostEditor post={post} onSave={handleSave} isLoading={isPending} />
    </div>
  );
}
