import type { NextConfig } from "next";

const patterns: { protocol: "http" | "https"; hostname: string; port?: string; pathname: string }[] = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "1337",
    pathname: "/uploads/**",
  },
];

// Prod'da Strapi farklı bir domainde olabilir; ENV'den hostname'i ekleyelim
try {
  const url = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (url) {
    const u = new URL(url);
    patterns.push({
      protocol: (u.protocol.replace(":", "") as "http" | "https") || "https",
      hostname: u.hostname,
      pathname: "/uploads/**",
      ...(u.port ? { port: u.port } : {}),
    });
  }
} catch {}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: patterns,
  },
};

export default nextConfig;
