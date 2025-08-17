"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const r = useRouter();
  const sp = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Giriş başarısız");
      const next = sp.get("next") || "/admin";
      r.push(next);
    } catch (e: any) {
      setError(e?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Yönetici Girişi</h2>
      <div>
        <label className="block text-sm mb-1">Şifre</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <button disabled={loading} className="px-3 py-2 rounded bg-[#969B38] text-white w-full">Giriş Yap</button>
    </form>
  );
} 