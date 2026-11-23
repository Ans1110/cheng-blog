"use client";

import { cn } from "@/lib/utils";
import { pdfFileName, pdfProxyUrl } from "@/utils/pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize,
  Minimize,
  Minus,
  MoveHorizontal,
  Plus,
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.25;
/** Browsers refuse (or blank out) canvases much past ~16M pixels; tall pages get a lower DPR instead. */
const MAX_CANVAS_PIXELS = 16_000_000;
const PAGE_PADDING = 24; // px around the page column, each side

type PageSize = { width: number; height: number };

/** pdf.js touches browser globals at import time, so it's loaded on the client only, once. */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
const loadPdfjs = () => {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return pdfjs;
  });
  return pdfjsPromise;
};

/** Custom PDF reader: pages drawn with pdf.js onto canvases, under the site's own toolbar. */
export function PdfViewer({ url: storedUrl, title }: { url: string; title: string }) {
  const url = pdfProxyUrl(storedUrl);
  const fileName = pdfFileName(storedUrl);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [zoom, setZoom] = useState(1); // relative to "fit width"
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [fullscreen, setFullscreen] = useState(false);

  // Load the document and every page's base size (cheap: no rendering).
  // Callers remount via `key` when the URL changes, so no state reset here.
  useEffect(() => {
    let cancelled = false;
    let destroyTask: (() => void) | undefined;

    loadPdfjs()
      .then(async (pdfjs) => {
        const task = pdfjs.getDocument({ url });
        destroyTask = () => void task.destroy();
        task.onProgress = ({ loaded: l, total }: { loaded: number; total: number }) => {
          if (total) setProgress(Math.min(1, l / total));
        };
        const loaded = await task.promise;
        const pageSizes = await Promise.all(
          Array.from({ length: loaded.numPages }, async (_, i) => {
            const p = await loaded.getPage(i + 1);
            const v = p.getViewport({ scale: 1 });
            return { width: v.width, height: v.height };
          }),
        );
        if (cancelled) return;
        setSizes(pageSizes);
        setDoc(loaded);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load the PDF");
      });

    return () => {
      cancelled = true;
      destroyTask?.(); // also tears down the loaded document
    };
  }, [url]);

  // Track the viewer width so "100%" always means "fits the width".
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setViewWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxPageWidth = sizes.length ? Math.max(...sizes.map((s) => s.width)) : 0;
  const fitScale = maxPageWidth && viewWidth ? (viewWidth - PAGE_PADDING * 2) / maxPageWidth : 0;
  const scale = fitScale * zoom;

  // Zoom around the middle of the view rather than jumping to the top.
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const changeZoom = useCallback((next: number | ((z: number) => number)) => {
    const el = scrollRef.current;
    if (el) {
      anchor.current = {
        x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth,
        y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight,
      };
    }
    setZoom((z) => {
      const value = typeof next === "function" ? next(z) : next;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    });
  }, []);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const a = anchor.current;
    if (!el || !a) return;
    el.scrollLeft = a.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = a.y * el.scrollHeight - el.clientHeight / 2;
    anchor.current = null;
  }, [zoom]);

  // ⌘/Ctrl + wheel (and trackpad pinch) zooms the document, not the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      changeZoom((z) => z * Math.exp(-e.deltaY * 0.01));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [changeZoom]);

  // Current page = the one crossing the upper third of the view.
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const line = el.scrollTop + el.clientHeight / 3;
    let current = 1;
    pageRefs.current.forEach((p, i) => {
      if (p && p.offsetTop <= line) current = i + 1;
    });
    if (current !== page) {
      setPage(current);
      setPageInput(String(current));
    }
  };

  const goTo = (n: number) => {
    const target = Math.min(sizes.length, Math.max(1, n));
    const el = scrollRef.current;
    const p = pageRefs.current[target - 1];
    if (el && p) el.scrollTo({ top: p.offsetTop - PAGE_PADDING, behavior: "smooth" });
    setPage(target);
    setPageInput(String(target));
  };

  // Drag to pan with the mouse once the page is wider/taller than the view.
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    const d = drag.current;
    if (!el || !d) return;
    el.scrollLeft = d.left - (e.clientX - d.x);
    el.scrollTop = d.top - (e.clientY - d.y);
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // Fullscreen on the viewer itself.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.();
  };

  const ready = !!doc && scale > 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "glass flex flex-col overflow-hidden rounded-3xl lg:-mx-24 xl:-mx-40",
        fullscreen && "!mx-0 rounded-none bg-[var(--background)]",
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--glass-border)] px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <FileText className="size-4 shrink-0 text-[var(--glow)]" />
          <span className="truncate text-sm font-semibold" title={fileName}>
            {fileName}
          </span>
        </div>

        {ready && (
          <div className="flex items-center gap-1 text-sm">
            {sizes.length > 1 && (
              <>
                <ToolButton label="Previous page" onClick={() => goTo(page - 1)} disabled={page <= 1}>
                  <ChevronLeft className="size-4" />
                </ToolButton>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = Number(pageInput);
                    if (Number.isFinite(n)) goTo(n);
                  }}
                  className="flex items-center gap-1 tabular-nums"
                >
                  <input
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                    onBlur={() => setPageInput(String(page))}
                    inputMode="numeric"
                    aria-label="Page number"
                    className="w-9 rounded-md bg-foreground/5 py-0.5 text-center outline-none focus:ring-1 focus:ring-[var(--dream-lilac)]"
                  />
                  <span className="text-muted-foreground">/ {sizes.length}</span>
                </form>
                <ToolButton
                  label="Next page"
                  onClick={() => goTo(page + 1)}
                  disabled={page >= sizes.length}
                >
                  <ChevronRight className="size-4" />
                </ToolButton>
                <Divider />
              </>
            )}

            <ToolButton label="Zoom out" onClick={() => changeZoom((z) => z / ZOOM_STEP)} disabled={zoom <= MIN_ZOOM}>
              <Minus className="size-4" />
            </ToolButton>
            <button
              type="button"
              onClick={() => changeZoom(1)}
              title="Fit to width"
              className="w-12 rounded-md py-0.5 text-center tabular-nums text-muted-foreground transition-colors hover:text-foreground"
            >
              {Math.round(zoom * 100)}%
            </button>
            <ToolButton label="Zoom in" onClick={() => changeZoom((z) => z * ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>
              <Plus className="size-4" />
            </ToolButton>
            <ToolButton label="Fit to width" onClick={() => changeZoom(1)} className="hidden sm:inline-flex">
              <MoveHorizontal className="size-4" />
            </ToolButton>
            <Divider />
            <ToolButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </ToolButton>
          </div>
        )}

        <div className="flex items-center gap-1">
          <ToolLink label="Open in new tab" href={url} external>
            <ExternalLink className="size-4" />
          </ToolLink>
          <ToolLink label="Download" href={url} download={fileName}>
            <Download className="size-4" />
          </ToolLink>
        </div>
      </div>

      {/* Pages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={`PDF: ${title}`}
        className={cn(
          "relative overflow-auto overscroll-contain bg-foreground/[0.04] dark:bg-black/30 select-none",
          fullscreen ? "flex-1" : "h-[80vh] min-h-[520px]",
          ready && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
            <FileText className="size-8" />
            <p>Couldn&rsquo;t show this PDF here.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-dream !px-5 !py-2 text-sm">
              Open PDF
            </a>
          </div>
        ) : !ready ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <div className="h-1 w-40 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-[var(--dream-lilac)] transition-[width] duration-300"
                style={{ width: `${Math.max(8, progress * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div
            className="mx-auto flex w-max min-w-full flex-col items-center gap-6"
            style={{ padding: PAGE_PADDING }}
          >
            {sizes.map((size, i) => (
              <PdfPage
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                doc={doc}
                pageNumber={i + 1}
                width={size.width * scale}
                height={size.height * scale}
                scale={scale}
                root={scrollRef}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** One page: a placeholder of the right size that draws itself only when near the view. */
function PdfPage({
  doc,
  pageNumber,
  width,
  height,
  scale,
  root,
  ref,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  root: React.RefObject<HTMLDivElement | null>;
  ref: (el: HTMLDivElement | null) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      root: root.current,
      rootMargin: "600px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    // Wait for zoom to settle so a pinch doesn't queue dozens of renders.
    const timer = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const dpr = window.devicePixelRatio || 1;
        const outScale = Math.min(dpr, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));
        const viewport = page.getViewport({ scale: scale * outScale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        renderTask = page.render({ canvas, viewport });
        await renderTask.promise;
        if (!cancelled) setDrawn(true);
      } catch (e) {
        if (!(e instanceof Error && e.name === "RenderingCancelledException")) console.error(e);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      renderTask?.cancel();
    };
  }, [doc, pageNumber, scale, width, height, near]);

  return (
    <div
      ref={(el) => {
        boxRef.current = el;
        ref(el);
      }}
      className="relative shrink-0 overflow-hidden rounded-md bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className="block size-full" />
      {!drawn && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.03]">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/80 backdrop-blur">
        {pageNumber}
      </span>
    </div>
  );
}

const toolClass =
  "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-35";

function ToolButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn(toolClass, className)} {...props}>
      {children}
    </button>
  );
}

function ToolLink({
  label,
  href,
  external,
  download,
  children,
}: {
  label: string;
  href: string;
  external?: boolean;
  download?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={toolClass}
    >
      {children}
    </a>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-[var(--glass-border)]" />;
}
