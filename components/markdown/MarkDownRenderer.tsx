"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Image from "next/image";
import { normalizeMarkdown } from "@/utils/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({
  content,
  className,
}: MarkdownRendererProps) => {
  return (
    <div
      className={`prose prose-zinc dark:prose-invert max-w-none ${
        className || ""
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-[var(--glow)] underline-offset-4 hover:underline"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="bg-[var(--code-bg)] text-zinc-100 rounded-2xl p-4 overflow-x-auto border border-[var(--glass-border)] shadow-[0_10px_40px_-15px_var(--dream-lilac)]">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="font-display text-4xl font-normal mt-10 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-3xl md:text-4xl font-normal mt-10 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display italic text-2xl md:text-3xl font-normal mt-8 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 [&>p]:my-1 [&>p]:inline">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--dream-lilac)] pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          img: ({ src, alt }) => (
            <span className="block relative w-full my-4">
              <Image
                src={src as string}
                alt={alt || ""}
                width={800}
                height={600}
                className="rounded-2xl max-w-full h-auto mx-auto object-contain"
                unoptimized
              />
            </span>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
