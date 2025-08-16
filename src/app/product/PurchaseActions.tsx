"use client";
import { useState } from "react";
import { useCart } from "@/app/cart/CartContext";
import { ShoppingCart, Zap } from "lucide-react";

export default function PurchaseActions({ id, name, price, image, disabled }: { id: string; name: string; price: number | null; image?: string | null; disabled?: boolean }) {
  const { addItem, open } = useCart();
  const [qty, setQty] = useState(1);
  const canAct = !disabled;
  const unitPrice = Number(price) || 0;
  const total = unitPrice * qty;

  function onAddToCart() {
    if (!canAct) return;
    addItem({ id, name, price: unitPrice, image: image ?? undefined }, qty);
    open();
  }

  function buildWhatsAppUrl() {
    const lines = [
      `Merhaba, "${name}" ürününden ${qty} adet (toplam: ${total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}) sipariş vermek istiyorum.`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905079656645";
    return `https://wa.me/${phone}?text=${text}`;
  }

  function onQuickOrder() {
    if (!canAct) return;
    const href = buildWhatsAppUrl();
    window.open(href, "_blank");
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Adet</label>
        <div className="inline-flex items-center gap-2">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2 py-1.5 rounded bg-gray-200">-</button>
          <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-14 border rounded px-2 py-1.5 text-center" />
          <button onClick={() => setQty(q => q + 1)} className="px-2 py-1.5 rounded bg-gray-200">+</button>
          <span className="text-xs text-gray-600 ml-2">Toplam: {total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAddToCart}
          disabled={!canAct}
          className={`aspect-square w-20 md:w-24 rounded-lg border flex flex-col items-center justify-center gap-1 ${canAct ? "bg-[#969B38] text-white hover:bg-[#7f8430]" : "bg-gray-400 text-white cursor-not-allowed"}`}
          aria-label="Sepete Ekle"
        >
          <ShoppingCart size={20} />
          <span className="font-semibold text-[11px]">Sepete Ekle</span>
        </button>
        <button
          onClick={onQuickOrder}
          disabled={!canAct}
          className={`aspect-square w-20 md:w-24 rounded-lg border flex flex-col items-center justify-center gap-1 ${canAct ? "bg-[#23262F] text-white hover:bg-[#1b1e26]" : "bg-gray-400 text-white cursor-not-allowed"}`}
          aria-label="Hemen Sipariş Ver"
        >
          <Zap size={20} />
          <span className="font-semibold text-[11px]">Hemen Sipariş Ver</span>
        </button>
      </div>
    </div>
  );
} 