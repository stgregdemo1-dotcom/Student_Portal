import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/Home",
        permanent: false, 
      },
    ];
  },
};

export default nextConfig;