"use client";

import DailyEditor from "@/components/admin/DailyEditor";
import { useCreateDailyPost } from "@/hooks/useDaily";
import type { CreateDailyPostInput } from "@/utils/validation";
import { useRouter } from "next/navigation";

export default function NewDailyPostPage() {
  const router = useRouter();
  const createPost = useCreateDailyPost();

  const handleSave = async (data: CreateDailyPostInput) => {
    await createPost.mutateAsync(data);
    router.push("/admin/daily");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Daily Post</h1>
        <p className="text-muted-foreground">Upload photos, write a caption for each, and tell the story</p>
      </div>
      <DailyEditor onSave={handleSave} />
    </div>
  );
}
