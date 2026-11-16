import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // gzip/brotli compression for HTML, JS and CSS responses.
  compress: true,
  // Serve modern image formats first: AVIF where supported, WebP otherwise.
  // JPEG stays as the fallback for older browsers.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // from JSON files that the admin can change at runtime, so pages and API
  // routes use `force-dynamic` instead of build-time caching.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
