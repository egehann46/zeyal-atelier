import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file gerekli" }, { status: 400 });
    }
    const anyFile = file as any;
    const originalName: string = (anyFile?.name as string) || "upload.bin";
    const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
    const filename = `${randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const path = `uploads/${filename}`;
    const { error } = await supabaseAdmin.storage
      .from("products")
      .upload(path, Buffer.from(arrayBuffer), { contentType: file.type || "application/octet-stream", upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Her durumda uzun süreli signed URL üret ve bunu dön (public bucket olsa bile çalışır)
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("products")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed?.signedUrl) {
      // Son çare: public URL'i dön (bucket public ise çalışır)
      const { data: pub } = supabaseAdmin.storage.from("products").getPublicUrl(path);
      if (pub?.publicUrl) return NextResponse.json({ url: pub.publicUrl });
      return NextResponse.json({ error: signErr?.message || "signed url olusturulamadi" }, { status: 500 });
    }
    return NextResponse.json({ url: signed.signedUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload error" }, { status: 500 });
  }
} 