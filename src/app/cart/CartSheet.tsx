"use client";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

export default function CartSheet() {
  const { items, totalPrice, isOpen, close, updateQuantity, removeItem, clear } = useCart();
  const router = useRouter();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Sepet</h3>
          <button onClick={close} className="px-2 py-1 rounded bg-gray-200">Kapat</button>
        </div>
        <div className="flex-1 overflow-auto space-y-3">
          {items.length === 0 && <div className="text-gray-500">Sepetiniz boş</div>}
          {items.map(i => (
            <div
              key={i.id}
              className="flex gap-3 border rounded p-2 cursor-pointer hover:bg-gray-50"
              onClick={() => { close(); router.push(`/product/${i.id}`); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close(); router.push(`/product/${i.id}`); } }}
            >
              <img src={i.image || "/placeholder.png"} alt={i.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-gray-500">{(Number(i.price) || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(i.id, Math.max(1, i.quantity - 1)); }} className="px-2 py-1 rounded bg-gray-200">-</button>
                  <input value={i.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => updateQuantity(i.id, Math.max(1, Number(e.target.value) || 1))} className="w-14 border rounded px-2 py-1 text-center" />
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(i.id, i.quantity + 1); }} className="px-2 py-1 rounded bg-gray-200">+</button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={(e) => { e.stopPropagation(); removeItem(i.id); }} className="text-red-600 text-sm">Kaldır</button>
                <div className="text-sm font-semibold">{(((Number(i.price) || 0) * i.quantity)).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Ara Toplam</span>
            <span className="font-bold">{totalPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button onClick={clear} className="px-3 py-2 rounded bg-gray-200">Temizle</button>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); const wa = buildWhatsAppMessage(items, totalPrice); window.open(wa, "_blank"); }}
              className="px-3 py-2 rounded bg-[#969B38] text-white"
            >
              Sipariş Ver
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildWhatsAppMessage(items: ReturnType<typeof useCart>["items"], total: number) {
  const lines = [
    "Merhaba, aşağıdaki ürünler için sipariş vermek istiyorum:",
    ...items.map(i => `• ${i.name} x${i.quantity} = ${((Number(i.price) || 0) * i.quantity).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`),
    `Ara Toplam: ${total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905079656645";
  return `https://wa.me/${phone}?text=${text}`;
} 