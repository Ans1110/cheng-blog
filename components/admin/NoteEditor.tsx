"use client";

import { useCategories } from "@/hooks/useCategories";
import { Note } from "@/types/note";
import { mdUpload } from "@/utils/mdUpload";
import { createNoteSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { ControlledInput } from "../ui/controlled-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ControlledTextarea } from "../ui/controlled-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MarkdownRenderer from "../markdown/MarkDownRenderer";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type NoteFormData = z.input<typeof createNoteSchema>;

const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return LucideIcons.FileText;
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
  if (typeof IconComponent === "function") {
    return IconComponent as LucideIcons.LucideIcon;
  }
  return LucideIcons.FileText;
};

interface NoteEditorProps {
  note?: Note;
  onSave: (data: NoteFormData) => Promise<void>;
  isLoading?: boolean;
}

export const NoteEditor = ({
  note,
  onSave,
  isLoading = false,
}: NoteEditorProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const form = useForm<NoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      slug: note?.slug || "",
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || "",
      tags: note?.tags || [],
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch("title");
  const contenet = watch("content");

  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue("tags", newTags);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    mdUpload(
      file,
      (name, value) => setValue(name as keyof NoteFormData, value),
      setTags,
      watch
    );

    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: NoteFormData) => {
    setIsSaving(true);
    try {
      await onSave({ ...data, tags });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back to Notes
          </Button>
          <Button type="submit" disabled={isSaving || isLoading}>
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <ControlledInput
                name="title"
                label="Title *"
                placeholder="Enter note title"
                className="w-full"
              />
            </div>

            {/* Content with preview */}
            <Tabs defaultValue="write" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div>
                  <ControlledInput
                    name="file"
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Upload Markdown
                  </Button>
                </div>
              </div>
              <TabsContent value="write" className="space-y-2">
                <ControlledTextarea
                  name="content"
                  label="Content *"
                  placeholder="Write your note content here..."
                  className="h-[500px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <Card>
                  <CardContent className="pt-6">
                    {contenet ? (
                      <MarkdownRenderer content={contenet} />
                    ) : (
                      <p className="text-muted-foreground">
                        Nothing to preview yet...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Note Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Slug */}
                <div className="space-y-2">
                  <ControlledInput
                    name="slug"
                    label="Slug"
                    placeholder="Enter note slug"
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                  >
                    Generate
                  </Button>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  {isCategoriesLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading categories...
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <div className="grid gap-2">
                      {categories.map((category) => {
                        const IconComp = getIconComponent(category.icon);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setValue("category", category.id)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer",
                              form.getValues("category") === category.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <div
                              className={cn(
                                "mt-0.5 p-1.5 rounded-md",
                                form.getValues("category") === category.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <IconComp className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium text-sm",
                                  form.getValues("category") === category.id
                                    ? "text-primary"
                                    : "text-foreground"
                                )}
                              >
                                {category.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {category.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No categories found. Please create a category first.
                    </div>
                  )}
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <ControlledInput
                      name="tagInput"
                      placeholder="Enter tags"
                      className="w-full"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="icon">
                      <LucideIcons.Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <Button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                          size="icon"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
