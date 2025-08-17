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

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
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
  return NextResponse.json({ data: insert.data }, { status: 201 });
} 