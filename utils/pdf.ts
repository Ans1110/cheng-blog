/** Same-origin URL for a PDF stored on Cloudinary (served by api/files.ts). */
export const pdfProxyUrl = (url: string) => `/api/files/pdf?url=${encodeURIComponent(url)}`;

/** Readable file name from a stored PDF URL. */
export const pdfFileName = (url: string) => decodeURIComponent(url.split("/").pop() ?? "document.pdf");
