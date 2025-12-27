"use client";

import PostEditor from "@/components/admin/PostEditor";
import { useCreatePost } from "@/hooks/usePosts";
import { CreatePost } from "@/types/post";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useCreatePost();

  const handleSave = async (data: CreatePost) => {
    await createPost.mutateAsync(data);
    router.push("/admin/posts");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Post</h1>
        <p className="text-muted-foreground">Create a new post</p>
      </div>
      <PostEditor onSave={handleSave} />
    </div>
  );
}
