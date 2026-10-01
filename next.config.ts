import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the trycloudflare.com host header
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "localhost:3000",
  ],
};

export default nextConfig;
