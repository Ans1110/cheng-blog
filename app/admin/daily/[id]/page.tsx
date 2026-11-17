"use client";

import DailyEditor from "@/components/admin/DailyEditor";
import { useDailyPostById, useUpdateDailyPost } from "@/hooks/useDaily";
import type { CreateDailyPostInput } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditDailyPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: post, isLoading, error } = useDailyPostById(id);
  const updatePost = useUpdateDailyPost();

  const handleSave = async (data: CreateDailyPostInput) => {
    await updatePost.mutateAsync({ id, data });
    router.push("/admin/daily");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="size-4 animate-spin" /> Loading post...
      </div>
    );
  }

  if (error || !post) {
    return <p className="text-destructive py-12">{error?.message || "Post not found"}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Daily Post</h1>
        <p className="text-muted-foreground">{post.title}</p>
      </div>
      <DailyEditor key={post.id} post={post} onSave={handleSave} />
    </div>
  );
}
