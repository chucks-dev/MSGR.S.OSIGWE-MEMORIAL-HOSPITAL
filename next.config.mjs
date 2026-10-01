/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Keep the image optimizer on for lighter pages on slow connections.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Placeholder photos during development. Remove once real photos are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
