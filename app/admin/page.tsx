"use client";

import { usePosts } from "@/hooks/usePosts";
import { useNotes } from "@/hooks/useNotes";
import { FileText, BookOpen, Eye, PenSquare, Folder } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { QuickActions } from "@/components/admin/QuickActions";
import {
  RecentItemsList,
  RecentItem,
} from "@/components/admin/RecentItemsList";
import { useProjects } from "@/hooks/useProjects";

export default function AdminDashboardPage() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const publishedPosts = posts?.filter((p) => p.published) || [];
  const draftPosts = posts?.filter((p) => !p.published) || [];

  const recentPostItems: RecentItem[] =
    posts?.slice(0, 5).map((post) => ({
      id: post.slug,
      title: post.title,
      createdAt: post.createdAt,
      badge: !post.published
        ? { text: "(Draft)", className: "ml-2 text-yellow-600" }
        : undefined,
    })) || [];

  const recentNoteItems: RecentItem[] =
    notes?.slice(0, 5).map((note) => ({
      id: note.slug,
      title: note.title,
      createdAt: note.createdAt,
      subtitle: note.category,
    })) || [];

  const recentProjectItems: RecentItem[] =
    projects?.slice(0, 5).map((project) => ({
      id: project.id.toString(),
      title: project.title,
      createdAt: project.createdAt,
      subtitle: project.tags.join(", "),
    })) || [];

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
        <StatsCard
          title="Total Projects"
          value={projects?.length || 0}
          description="All projects"
          icon={Folder}
          isLoading={projectsLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentItemsList
          title="Recent Posts"
          description="The latest blog posts"
          items={recentPostItems}
          basePath="/admin/posts"
          isLoading={postsLoading}
          emptyMessage="No posts yet"
        />
        <RecentItemsList
          title="Recent Notes"
          description="The latest notes"
          items={recentNoteItems}
          basePath="/admin/notes"
          isLoading={notesLoading}
          emptyMessage="No notes yet"
        />
        <RecentItemsList
          title="Recent Projects"
          description="The latest projects"
          items={recentProjectItems}
          basePath="/admin/projects"
          isLoading={projectsLoading}
          emptyMessage="No projects yet"
        />
      </div>
    </div>
  );
}
