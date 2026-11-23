import { Hono } from "hono";
import { uploadRateLimiter } from "./middleware/rateLimiter";
import { authMiddleware } from "./middleware/auth";
import cloudinary from "@/lib/cloudinary";

const upload = new Hono();

// Auth middleware for all upload routes
upload.use("*", authMiddleware);

// POST /upload - upload an image or PDF to Cloudinary
upload.post("/", uploadRateLimiter, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file)
      return c.json({ success: false, message: "File is required" }, 400);

    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const isPdf = file.type === "application/pdf";
    if (!isPdf && !imageTypes.includes(file.type))
      return c.json({ success: false, message: "Invalid file type" }, 400);

    const maxSize = (isPdf ? 10 : 5) * 1024 * 1024;
    if (file.size > maxSize)
      return c.json(
        { success: false, message: `File size exceeds ${isPdf ? 10 : 5}MB` },
        400
      );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // generate public ID
    const timestamp = Date.now();
    const publicId = projectId
      ? `project_${projectId}_${timestamp}`
      : `temp_${timestamp}`;

    // PDFs go up as raw files: Cloudinary blocks PDF delivery from the image
    // pipeline by default, and raw keeps the original bytes. Raw public IDs
    // need the extension so the URL serves as a .pdf.
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER,
      public_id: isPdf ? `${publicId}.pdf` : publicId,
      resource_type: isPdf ? "raw" : "image",
    });

    return c.json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json(
      {
        success: false,
        message: "Error uploading file",
      },
      500
    );
  }
});

export default upload;
