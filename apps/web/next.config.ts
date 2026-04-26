import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "**.vinted.co.uk" },
    ],
  },
};

export default nextConfig;
