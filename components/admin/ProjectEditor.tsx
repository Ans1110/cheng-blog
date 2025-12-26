"use client";

import { Project } from "@/types/project";
import { CreateProjectInput, createProjectSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Plus, Save, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ControlledInput } from "../ui/controlled-input";
import { ControlledTextarea } from "../ui/controlled-textarea";
import Image from "next/image";

type ProjectFormData = z.input<typeof createProjectSchema>;

interface ProjectEditorProps {
  project?: Project;
  onSave: (data: CreateProjectInput) => Promise<void>;
  isLoading?: boolean;
}

const ProjectEditor = ({
  project,
  onSave,
  isLoading = false,
}: ProjectEditorProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      imageUrl: project?.imageUrl || "",
      tags: project?.tags || [],
      projectUrl: project?.projectUrl || "",
      githubUrl: project?.githubUrl || "",
    },
  });

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (project?.id) {
        formData.append("projectId", String(project.id));
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload failed");
      }

      setValue("imageUrl", result.data.url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSaving(true);
    try {
      const finalData = {
        ...data,
        tags,
        imageUrl: data.imageUrl || undefined,
        projectUrl: data.projectUrl || undefined,
        githubUrl: data.githubUrl || undefined,
      };
      await onSave(finalData);
      router.push("/admin/projects");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Project"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <ControlledInput
                    name="title"
                    label="Title *"
                    placeholder="Enter project title"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <ControlledTextarea
                    name="description"
                    label="Description *"
                    placeholder="Enter project description"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <ControlledInput
                      type="url"
                      name="imageUrl"
                      label="Image URL"
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleUploadImage}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {uploadError && (
                    <p className="text-sm text-destructive">{uploadError}</p>
                  )}
                  {errors.imageUrl && (
                    <p className="text-sm text-destructive">
                      {errors.imageUrl.message}
                    </p>
                  )}
                  {getValues("imageUrl") && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={getValues("imageUrl") || ""}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <ControlledInput
                    type="url"
                    name="projectUrl"
                    label="Project URL"
                    placeholder="Enter project URL"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <ControlledInput
                    type="url"
                    name="githubUrl"
                    label="GitHub URL"
                    placeholder="Enter GitHub URL"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <ControlledInput
                    name="tags"
                    label="Tags"
                    placeholder="Enter tags"
                    className="w-full"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} size="icon">
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20 hover:text-destructive transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tags yet. Add some to categorize your project.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProjectEditor;
export { ProjectEditor };
