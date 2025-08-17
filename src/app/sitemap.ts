import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://zeyalatelier.com";

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabaseAdmin.from("products").select("id");
    productUrls = (data || []).map((p: any) => ({
      url: `${base}/product/${p.id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {}

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...productUrls,
  ];
} 
