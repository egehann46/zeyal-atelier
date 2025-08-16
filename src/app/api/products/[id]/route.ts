import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isUndefinedColumnError(err: any): boolean {
  const msg = (err && (err.message || err.error || ""))?.toString().toLowerCase();
  return (
    (err && (err.code === "42703" || err.code === "PGRST204" || err.code === "PGRST103")) ||
    msg.includes("schema cache") ||
    msg.includes("column")
  );
}

function extractStoragePath(url: string): string | null {
  try {
    const u = new URL(url);
    const p = u.pathname;
    const markers = [
      "/storage/v1/object/sign/products/",
      "/storage/v1/object/public/products/",
      "/object/sign/products/",
      "/object/public/products/",
    ];
    for (const m of markers) {
      const idx = p.indexOf(m);
      if (idx >= 0) {
        const rest = p.slice(idx + m.length);
        return rest.split("?")[0];
      }
    }
    // Bazı URL'ler doğrudan /products/ ile başlayabilir
    const idx2 = p.indexOf("/products/");
    if (idx2 >= 0) {
      const rest = p.slice(idx2 + "/products/".length);
      return rest.split("?")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function PUT(request: Request, { params }: any) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { name, description, price, image_url, image_urls, categories, dimensions, color, volume, stock } = body ?? {};

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

  let upd = await supabaseAdmin
    .from("products")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (upd.error && isUndefinedColumnError(upd.error)) {
    const { image_urls: _i, dimensions: _d, color: _c, volume: _v, stock: _s, ...noExtra } = row as any;
    upd = await supabaseAdmin.from("products").update(noExtra).eq("id", id).select().single();
  }
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
  return NextResponse.json({ data: upd.data });
}

export async function DELETE(_request: Request, { params }: any) {
  const { id } = params;
  // Önce görsel URL'lerini al
  const { data: product } = await supabaseAdmin.from("products").select("image_url, image_urls").eq("id", id).single();

  // Sonra ürünü sil
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Storage temizliği (best-effort)
  try {
    const urls: string[] = [];
    if (product?.image_url) urls.push(product.image_url as any);
    if (Array.isArray(product?.image_urls)) urls.push(...(product!.image_urls as any[]));
    const paths = urls
      .map((u) => (typeof u === "string" ? extractStoragePath(u) : null))
      .filter((x): x is string => Boolean(x));
    if (paths.length) {
      await supabaseAdmin.storage.from("products").remove(paths);
    }
  } catch {
    // yut
  }

  return NextResponse.json({ ok: true });
} 