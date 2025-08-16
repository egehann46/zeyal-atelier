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
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
} 