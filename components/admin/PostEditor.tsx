"use client";

import { Post } from "@/types/post";
import { mdUpload } from "@/utils/mdUpload";
import { createPostSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { ArrowLeft, Plus, RefreshCcw, Save, Upload, X } from "lucide-react";
import { Label } from "../ui/label";
import { ControlledSwitch } from "../ui/controlled-switch";
import { ControlledInput } from "../ui/controlled-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ControlledTextarea } from "../ui/controlled-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MarkdownRenderer from "../markdown/MarkDownRenderer";
import { Badge } from "../ui/badge";

type PostFormData = z.input<typeof createPostSchema>;

interface PostEditorProps {
  post?: Post;
  onSave: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
}

const PostEditor = ({ post, onSave, isLoading = false }: PostEditorProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      slug: post?.slug || "",
      title: post?.title || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      tags: post?.tags || [],
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch("title");
  const content = watch("content");

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
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    mdUpload(
      file,
      (name, value) => setValue(name as keyof PostFormData, value),
      setTags,
      watch
    );

    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: PostFormData) => {
    setIsSaving(true);
    try {
      await onSave({ ...data, tags });
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
            onClick={() => router.push("/admin/posts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <div className="flex items-center gap-4">
            <ControlledSwitch name="published" label="Published" />
            <Button type="submit" disabled={isSaving || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <ControlledInput
                name="title"
                label="Title *"
                placeholder="Enter post title"
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
                  placeholder="Write your post content here..."
                  className="h-[500px] font-mono"
                />
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </TabsContent>
              <TabsContent value="preview">
                <Card>
                  <CardContent>
                    {content ? (
                      <MarkdownRenderer content={content} />
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
                <CardTitle className="text-lg">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Slug */}
                <div className="space-y-2">
                  <ControlledInput
                    name="slug"
                    label="Slug"
                    placeholder="Enter post slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                  >
                    <RefreshCcw className="size-4 mr-2" />
                    Generate
                  </Button>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <ControlledTextarea name="excerpt" label="Excerpt" />
                  {errors.excerpt && (
                    <p className="text-sm text-destructive">
                      {errors.excerpt.message}
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
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {errors.tags && (
                    <p className="text-sm text-destructive">
                      {errors.tags.message}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tags yet. Add some to categorize your post.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PostEditor;
export { PostEditor };
