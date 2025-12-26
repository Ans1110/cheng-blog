"use client";

import { usePosts } from "@/hooks/usePosts";
import { useNotes } from "@/hooks/useNotes";
import { FileText, BookOpen, Eye, PenSquare } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentPostsList } from "@/components/admin/RecentPostsList";
import { RecentNotesList } from "@/components/admin/RecentNotesList";

export default function AdminDashboardPage() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: notes, isLoading: notesLoading } = useNotes();

  const publishedPosts = posts?.filter((p) => p.published) || [];
  const draftPosts = posts?.filter((p) => !p.published) || [];
  const recentPosts = posts?.slice(0, 5) || [];
  const recentNotes = notes?.slice(0, 5) || [];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the blog admin panel
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Posts"
          value={posts?.length || 0}
          description={`${publishedPosts.length} published, ${draftPosts.length} drafts`}
          icon={FileText}
          isLoading={postsLoading}
        />
        <StatsCard
          title="Total Notes"
          value={notes?.length || 0}
          description="Across all categories"
          icon={BookOpen}
          isLoading={notesLoading}
        />
        <StatsCard
          title="Published"
          value={publishedPosts.length}
          description="Public posts"
          icon={Eye}
        />
        <StatsCard
          title="Drafts"
          value={draftPosts.length}
          description="Unpublished posts"
          icon={PenSquare}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentPostsList posts={recentPosts} isLoading={postsLoading} />
        <RecentNotesList notes={recentNotes} isLoading={notesLoading} />
      </div>
    </div>
  );
}
