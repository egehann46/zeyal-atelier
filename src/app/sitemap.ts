import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Sitemap'i günde bir kez yenile
export const revalidate = 86400; // 24 saat

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://zeyalatelier.com";

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabaseAdmin.from("products").select("id, created_at");
    productUrls = (data || []).map((p: any) => ({
      url: `${base}/product/${p.id}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: p.created_at ? new Date(p.created_at) : undefined,
    }));
  } catch {}

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1, lastModified: new Date() },
    ...productUrls,
  ];
}
