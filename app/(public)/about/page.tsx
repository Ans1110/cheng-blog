"use client";

import { AboutPageClient } from "@/components/about";
import { useLearning } from "@/hooks/useLearning";
import { Loader2 } from "lucide-react";

export default function AboutPage() {
  const { data: learning, isLoading: isLearningLoading, error } = useLearning();

  if (isLearningLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Error Loading Learning</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return <AboutPageClient data={learning || []} />;
}
