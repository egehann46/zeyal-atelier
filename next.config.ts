import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Eğer ileride prod ortamda kullanacaksan buraya ekleyebilirsin:
      // {
      //   protocol: "https",
      //   hostname: "zeyal-strapi.onrender.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
};

export default nextConfig;
