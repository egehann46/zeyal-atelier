import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Bu route'u 5 dakika boyunca önbelleğe al (ISR)
export const revalidate = 300;

function isUndefinedColumnError(err: any): boolean {
  const msg = (err && (err.message || err.error || ""))?.toString().toLowerCase();
  return (
    (err && (err.code === "42703" || err.code === "PGRST204" || err.code === "PGRST103")) ||
    msg.includes("schema cache") ||
    msg.includes("column")
  );
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,description,price,image_url,image_urls,categories,stock,created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const res = NextResponse.json({ data });
  // CDN (s-maxage) ve tarayıcı (max-age=0) önbellek politikası:
  // - Browser her istekte sunucuyu yoklar (must-revalidate), böylece admin ekledikten sonra hemen görür
  // - CDN 5 dk cacheler; on-demand revalidate ile anında geçersiz kılabiliyoruz
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate, s-maxage=300, stale-while-revalidate=86400");
  return res;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, description, price, image_url, image_urls, categories, dimensions, color, volume, stock } = body ?? {};
  if (!name) return NextResponse.json({ error: "name gerekli" }, { status: 400 });
  
  const row: Record<string, unknown> = {
    name,
    description: description ?? null,
    price: price ?? null,
    image_url: (image_url ?? ((Array.isArray(image_urls) && image_urls[0]) || null)),
    categories: Array.isArray(categories) ? categories : [],
    dimensions: dimensions ?? null,
    color: color ?? null,
    volume: volume ?? null,
    stock: stock === "" || stock == null ? null : String(stock),
  };
  if (Array.isArray(image_urls)) row.image_urls = image_urls;

  let insert = await supabaseAdmin.from("products").insert(row).select().single();
  if (insert.error && isUndefinedColumnError(insert.error)) {
    const { image_urls: _ignored1, dimensions: _d, color: _c, volume: _v, stock: _s, ...noExtra } = row as any;
    insert = await supabaseAdmin.from("products").insert(noExtra).select().single();
  }
  if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 500 });
  try {
    // Ürün listesi endpoint'ini anında geçersiz kıl → yeni ürün herkese hemen görünür
    revalidatePath("/api/products");
  } catch {}
  return NextResponse.json({ data: insert.data }, { status: 201 });
} 