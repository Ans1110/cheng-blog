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
import { useDeleteLearning, useLearning } from "@/hooks/useLearning";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminLearningPage() {
  const { data: experiences, isLoading } = useLearning();
  const deleteExperience = useDeleteLearning();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteExperience.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success("Experience deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete experience");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading experiences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Learning Journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your learning experiences
          </p>
        </div>
        <Link href="/admin/learning/new">
          <Button size="lg" className="hover:scale-105 transition-transform">
            <Plus className="mr-2 h-4 w-4" />
            New Year
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Loading learning experiences...
          </p>
        </div>
      ) : experiences?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No learning experiences yet. Add your first year!
          </p>
          <Link href="/admin/learning/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Year
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences?.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell className="font-bold text-primary">
                    {experience.year}
                  </TableCell>
                  <TableCell className="font-medium">
                    {experience.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {experience.skills?.slice(0, 4).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(experience.skills?.length || 0) > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{(experience.skills?.length || 0) - 4}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/learning/${experience.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(experience.id)}
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
        title="Delete Experience"
        description="Are you sure you want to delete this experience? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
