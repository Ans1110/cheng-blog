import { toast } from "sonner";

export const mdUpload = async (
  file: File | undefined,
  setValue: (name: string, value: string) => void,
  setTags: (tags: string[]) => void,
  watch: (name: string) => string
) => {
  if (!file) return null;

  if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
    toast.error("Please upload a Markdown file");
    return null;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target?.result as string;

    if (text) {
      const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const content = frontmatterMatch[2];

        // Parse frontmatter
        const titleMatch = frontmatter.match(/title:\s*["']?(.+?)["']?\s*$/m);
        const excerptMatch = frontmatter.match(
          /excerpt:\s*["']?(.+?)["']?\s*$/m
        );
        const tagsMatch = frontmatter.match(/tags:\s*\[(.+?)\]/);

        if (titleMatch) setValue("title", titleMatch[1].trim());
        if (excerptMatch) setValue("excerpt", excerptMatch[1].trim());
        if (tagsMatch) {
          const parsedTags = tagsMatch[1]
            .split(",")
            .map((t) => t.trim().replace(/["']/g, "").toLowerCase())
            .filter(Boolean);
          setTags(parsedTags);
        }

        setValue("content", content.trim());
      } else {
        setValue("content", text);
      }

      // Auto-generate slug from filename if title is empty
      if (!watch("title")) {
        const filename = file.name.replace(/\.(md|markdown)$/, "");
        const slug = filename
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        setValue("slug", slug);
        setValue(
          "title",
          filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        );
      }
    }
  };

  reader.readAsText(file);
};
