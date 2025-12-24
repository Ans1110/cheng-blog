import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { uploadRateLimiter } from "./middleware/rateLimiter";
import cloudinary from "@/lib/cloudinary";

const upload = new Hono();

// Auth middleware
upload.use("*", async (c, next) => {
  const session = getCookie(c, "admin_session");
  if (!session) return c.json({ success: false, message: "Unauthorized" }, 401);
  await next();
});

// POST /upload - upload image to Cloudinary
upload.post("/", uploadRateLimiter, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file)
      return c.json({ success: false, message: "File is required" }, 400);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type))
      return c.json({ success: false, message: "Invalid file type" }, 400);

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize)
      return c.json({ success: false, message: "File size exceeds 5MB" }, 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // generate public ID
    const timestamp = Date.now();
    const publicId = projectId
      ? `project_${projectId}_${timestamp}`
      : `temp_${timestamp}`;

    // upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER,
      public_id: publicId,
      resource_type: "image",
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
        message: "Error uploading image",
      },
      500
    );
  }
});

export default upload;
