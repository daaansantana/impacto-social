import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o ecrã Confiança passou para Como medimos
  async redirects() {
    return [
      { source: "/confianca", destination: "/como-medimos", permanent: false },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
