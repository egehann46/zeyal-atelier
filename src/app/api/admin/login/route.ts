import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as any));
  const password = body?.password as string | undefined;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin.zeyal16";
  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD tanimli degil" }, { status: 500 });
  }
  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Gecersiz sifre" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
} 