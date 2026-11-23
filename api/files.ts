import cloudinary from "@/lib/cloudinary";
import { Hono } from "hono";
import { rateLimiter } from "./middleware/rateLimiter";

const files = new Hono();

const pdfRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests, please try again later",
});

/**
 * Pull the raw public ID out of one of *our* Cloudinary PDF URLs, e.g.
 * https://res.cloudinary.com/<cloud>/raw/upload/v123/blog/temp_1.pdf → blog/temp_1.pdf
 */
const pdfPublicId = (raw: string | undefined) => {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const prefix = `/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/`;
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
  if (!url.pathname.startsWith(prefix)) return null;
  const id = decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^v\d+\//, "");
  if (!id.toLowerCase().endsWith(".pdf") || id.includes("..")) return null;
  return id;
};

// GET /files/pdf?url=<cloudinary raw url> - serve an uploaded PDF from our own origin.
// Cloudinary refuses public delivery of PDFs by default, so fetch it through the
// signed API download endpoint instead; this also lets the note page embed it.
files.get("/pdf", pdfRateLimiter, async (c) => {
  const publicId = pdfPublicId(c.req.query("url"));
  if (!publicId) return c.json({ success: false, message: "Invalid PDF url" }, 400);

  try {
    const downloadUrl = cloudinary.utils.private_download_url(publicId, "", {
      resource_type: "raw",
      type: "upload",
    });
    const res = await fetch(downloadUrl);
    if (!res.ok || !res.body) {
      return c.json({ success: false, message: "PDF not found" }, res.status === 404 ? 404 : 502);
    }
    const fileName = publicId.split("/").pop() ?? "document.pdf";
    return new Response(res.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
        // Uploads get a fresh public ID each time, so the bytes never change.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return c.json({ success: false, message: "Error serving PDF" }, 500);
  }
});

export default files;

