"use client";
import { useState } from "react";
import { useCart } from "@/app/cart/CartContext";
import { useToast } from "@/app/toast/ToastProvider";

export default function AddToCart({ id, name, price, image, disabled }: { id: string; name: string; price: number | null; image?: string | null; disabled?: boolean }) {
  const { addItem } = useCart();
  const { success } = useToast();
  const [qty, setQty] = useState(1);
  const canAdd = !disabled;
  const formatted = (Number(price) || 0) * qty;

  function add() {
    if (!canAdd) return;
    addItem({ id, name, price: price ?? 0, image: image ?? undefined }, qty);
    success("Ürün başarıyla sepete eklendi");
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-sm mb-1">Adet</label>
        <div className="flex items-center gap-2">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 rounded bg-gray-200">-</button>
          <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-16 border rounded px-2 py-2 text-center" />
          <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 rounded bg-gray-200">+</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Toplam: {formatted.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
      </div>
      <button onClick={add} disabled={!canAdd} className={`px-4 py-2 rounded-md ${canAdd ? "bg-[#969B38] text-white hover:bg-[#7f8430]" : "bg-gray-400 text-white cursor-not-allowed"}`}>
        Sepete Ekle
      </button>
    </div>
  );
} 