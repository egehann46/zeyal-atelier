"use client";

export default function HomeButton() {
  async function onClick() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  }
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-md bg-[#969B38] text-white">Anasayfa</button>
  );
} 