import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Video covers for the IVE Archive (YouTube / Bilibili).
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.hdslb.com" },
    ],
  },
};

export default nextConfig;
