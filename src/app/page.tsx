"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import Link from "next/link";
import { Menu, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Strapi URL
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "";
// WhatsApp numarası (ülke koduyla, başında + olmadan). İstersen .env ile override edebilirsin
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905079656645";

async function fetchStrapi<T>(path: string) {
  const res = await fetch(`${STRAPI_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Strapi error ${res.status}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${STRAPI_URL}${path}`;
}

// Rich text (blocks) → plain text
function blocksToText(blocks: any): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((node) =>
      Array.isArray(node?.children)
        ? node.children.map((c: any) => c?.text ?? "").join("")
        : ""
    )
    .join("\n")
    .trim();
}

// ---- Types (gevşek, iki formatı da desteklemek için optional tuttuk)
type AnyDoc = Record<string, any>;
type ProductDoc = AnyDoc;
type CategoryDoc = AnyDoc;

type ProductRes = { data: ProductDoc[] };
type CategoryRes = { data: CategoryDoc[] };

type HeaderProps = {
  onKategoriSec: (kategori: string) => void;
  onTumUrunler: () => void;
  kategoriler: string[];
};

const Header = ({ onKategoriSec, onTumUrunler, kategoriler }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header className="w-full fixed top-0 left-0 z-30 bg-[#F5F5DC] shadow-md h-20 flex items-center border-b border-gray-200">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pl-4 pr-8 md:pl-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={90}
              height={50}
              className="rounded-full object-cover"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-[#4f4f4f] font-poppins font-semibold text-base whitespace-nowrap">
            <a href="#hero" className="hover:text-logo transition">Anasayfa</a>
            <a
              href="#tum-urunler"
              className="hover:text-logo transition"
              onClick={e => { e.preventDefault(); onTumUrunler(); }}
            >
              Tüm Ürünler
            </a>
          </nav>
          <button
            ref={buttonRef}
            className={`p-2 rounded-md hover:bg-[#F5F5DC] transition ${open ? "bg-[#F5F5DC] ring-2 ring-[#969B38]" : ""}`}
            aria-label="Menüyü Aç"
            onClick={e => {
              e.stopPropagation();
              setOpen(x => !x);
            }}
          >
            <Menu size={32} />
          </button>
        </div>
      </div>
      <div
        ref={menuRef}
        className={`fixed right-8 top-20 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 transition-all duration-200 ease-out
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ minWidth: "220px" }}
      >
        <div className="p-4 border-b font-semibold text-[#969B38] text-lg">Kategori</div>
        <ul className="flex flex-col">
          <li>
            <a
              href="#tum-urunler"
              className="block px-6 py-3 hover:bg-[#F5F5DC] hover:text-logo transition text-[#363636]"
              onClick={e => { e.preventDefault(); setOpen(false); onTumUrunler(); }}
            >
              Tüm Ürünler
            </a>
          </li>
          {kategoriler.map((ad, i) => (
            <li key={i}>
              <a
                href="#tum-urunler"
                className="block px-6 py-3 hover:bg-[#F5F5DC] hover:text-logo transition text-[#363636]"
                onClick={e => { e.preventDefault(); setOpen(false); onKategoriSec(ad); }}
              >
                {ad}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<
    Array<{ ad: string; kategori: string; img: string; fiyat?: string; desc?: string }>
  >([]);
  const tumUrunlerRef = useRef<HTMLDivElement | null>(null);
  const [videoSources, setVideoSources] = useState<string[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Swipe refs (mobil)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDidSwipeRef = useRef(false);
  // index değişince videoyu yükle/oynat (416 gibi istek hatalarında yeniden denemeye yardımcı olur)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    try {
      el.load();
      const p = el.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {}
  }, [videoIndex, videoSources]);

  useEffect(() => {
    async function load() {
      try {
        // Kategoriler (flatten veya attributes desteklenir)
        const catJson = await fetchStrapi<CategoryRes>("/api/categories?pagination[pageSize]=100");
        const catArr = Array.isArray(catJson?.data) ? catJson.data : [];
        const cats = catArr
          .map((c: AnyDoc) => (c?.name ?? c?.attributes?.name) as string | undefined)
          .filter((x): x is string => Boolean(x));
        setCategories(cats);

        // Ürünler — flatten/Türkçe alan adları
        // populate=* kullanıyoruz ki medya ve olası relation'lar gelsin
        const prodJson = await fetchStrapi<ProductRes>("/api/products?pagination[pageSize]=100&populate=*");
        const prodArr = Array.isArray(prodJson?.data) ? prodJson.data : [];

        const mapped = prodArr.map((p: AnyDoc) => {
          const doc: AnyDoc = p?.attributes ?? p ?? {};

          // Ad
          const ad: string = doc.ad || doc.name || "Ürün";

          // Açıklama (rich text → text)
          const desc: string =
            typeof doc.description === "string" && doc.description
              ? doc.description
              : blocksToText(doc.aciklama);

          // Fiyat
          const rawPrice = doc.fiyat ?? doc.price;
          const fiyat =
            rawPrice == null
              ? undefined
              : (typeof rawPrice === "number" ? rawPrice : Number(rawPrice)).toLocaleString(
                  "tr-TR",
                  { style: "currency", currency: "TRY" }
                );

          // Görsel (resim: array) → medium > url fallback
          let imgUrl = "";
          const resim = doc.resim;
          if (Array.isArray(resim) && resim[0]) {
            imgUrl = resim[0]?.formats?.medium?.url || resim[0]?.url || "";
          } else if (doc.image?.data?.attributes?.url || doc.image?.url) {
            imgUrl = doc.image?.data?.attributes?.url || doc.image?.url || "";
          }
          const img = imgUrl ? mediaUrl(imgUrl) : "/placeholder.png";

          // Kategori adı (eğer sonra relation'ı eklersen otomatik dolacak)
          const kategori =
            doc?.kategori?.name ||
            doc?.kategori?.data?.attributes?.name ||
            doc?.category?.name ||
            doc?.category?.data?.attributes?.name ||
            "Diğer";

          return { ad, kategori, img, fiyat, desc };
        });

        setProducts(mapped);
      } catch (err) {
        console.error("Strapi fetch error:", err);
      }
    }
    load();
  }, []);

  // Public klasöründen video dosyalarını (video.mp4, video1.mp4, video2.mp4) tespit et
  useEffect(() => {
    let cancelled = false;
    async function detectVideos() {
      const candidates = ["/video.mp4", "/video1.mp4", "/video2.mp4"];
      try {
        const checks = await Promise.all(
          candidates.map(async (src) => {
            try {
              const res = await fetch(src, { method: "HEAD", cache: "no-store" });
              return res.ok ? src : null;
            } catch {
              return null;
            }
          })
        );
        const found = checks.filter((x): x is string => Boolean(x));
        if (!cancelled) setVideoSources(found.length > 0 ? found : ["/video.mp4"]);
      } catch {
        if (!cancelled) setVideoSources(["/video.mp4"]);
      }
    }
    detectVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToTumUrunler = () => setTimeout(() => {
    tumUrunlerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);

  const handleKategoriSec = (kategori: string) => {
    setSelectedCategory(kategori);
    scrollToTumUrunler();
  };
  const handleTumUrunler = () => {
    setSelectedCategory(null);
    scrollToTumUrunler();
  };

  const handleNextVideo = () => {
    setVideoIndex((i) => (videoSources.length ? (i + 1) % videoSources.length : i));
  };
  const handlePrevVideo = () => {
    setVideoIndex((i) => (videoSources.length ? (i - 1 + videoSources.length) % videoSources.length : i));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    touchDidSwipeRef.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchDidSwipeRef.current) return;
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    if (startX == null || startY == null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 40; // piksel
    if (absDx > absDy && absDx > threshold) {
      touchDidSwipeRef.current = true;
      if (dx < 0) {
        handleNextVideo(); // sola kaydır → sonraki
      } else {
        handlePrevVideo(); // sağa kaydır → önceki
      }
    }
  };
  const onTouchEnd = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDidSwipeRef.current = false;
  };

  const filtered = selectedCategory ? products.filter(u => u.kategori === selectedCategory) : products;

  return (
    <div className="bg-[#ffffff]">
      <Header onKategoriSec={handleKategoriSec} onTumUrunler={handleTumUrunler} kategoriler={categories} />

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center"
        style={{ paddingTop: "5rem" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={`${(videoSources[videoIndex] || "/video.mp4")}?v=${videoIndex}`}
          autoPlay
          muted
          playsInline
          onEnded={handleNextVideo}
          onError={handleNextVideo}
          preload="auto"
        />
        {/* Mobil ok göstergesi (sağda) */}
        <button
          type="button"
          onClick={handleNextVideo}
          aria-label="Sonraki videoya geç"
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white active:bg-black/40"
        >
          <ChevronRight size={22} />
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {videoSources.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setVideoIndex(idx)}
              onMouseEnter={() => setVideoIndex(idx)}
              aria-label={`${idx + 1}. videoya geç`}
              className={`w-3 h-3 rounded-full border-2 transition ${
                videoIndex === idx ? "border-white bg-white" : "border-white/80 hover:border-white"
              }`}
              style={{ backgroundClip: "padding-box" }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40 z-10" />
      </section>

      {/* Ürünler */}
      <section id="tum-urunler" ref={tumUrunlerRef} className="min-h-screen flex flex-col justify-center py-10 px-4">
        <h2 className="text-4xl font-abril text-logo mb-5 text-center">Tüm Ürünler</h2>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={handleTumUrunler}
            aria-pressed={selectedCategory === null}
            className={`px-3 py-1.5 rounded-full text-sm border transition focus:outline-none focus:ring-2 focus:ring-[#969B38]
              ${selectedCategory === null
                ? "bg-[#969B38] text-white border-[#969B38]"
                : "bg-white text-[#363636] border-gray-300 hover:bg-[#F5F5DC]"}
            `}
          >
            Tüm Ürünler
          </button>
          {categories.map((ad, i) => (
            <button
              key={i}
              onClick={() => handleKategoriSec(ad)}
              aria-pressed={selectedCategory === ad}
              className={`px-3 py-1.5 rounded-full text-sm border transition focus:outline-none focus:ring-2 focus:ring-[#969B38]
                ${selectedCategory === ad
                  ? "bg-[#969B38] text-white border-[#969B38]"
                  : "bg-white text-[#363636] border-gray-300 hover:bg-[#F5F5DC]"}
              `}
            >
              {ad}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {filtered.map((u, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="relative w-full h-60">
                <Image src={u.img} alt={u.ad} fill className="object-cover" priority={i === 0} 
                sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute left-0 top-0 p-3">
                  <span className="font-abril text-2xl text-white drop-shadow">{u.ad}</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-800 mb-4 flex-1">{u.desc}</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-orange-600 font-bold text-lg">{u.fiyat}</span>
                 <a
                   href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                     `Merhaba, "${u.ad}" (${u.kategori}) ürünü için sipariş oluşturmak istiyorum.` +
                     (u.fiyat ? ` Fiyat: ${u.fiyat}.` : "")
                   )}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#969B38] text-white hover:bg-[#7f8430] transition text-sm"
                   aria-label={`${u.ad} için WhatsApp'tan sipariş ver`}
                 >
                   Sipariş Ver
                 </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center text-gray-500 mt-10">Bu kategoride ürün bulunamadı.</div>}
      </section>

      {/* Footer */}
      <footer id="footer" className="min-h-screen flex flex-col justify-center bg-[#23262F] text-white py-25 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-center md:text-left flex-1">
          <div>
            <span className="font-abril text-2xl block mb-2">Zeyal Atelier</span>
            <Link href="/">
              <Image src="/logo.jpg" alt="Logo" width={120} height={120} className="rounded-full object-cover mx-auto" />
            </Link>
          </div>
          <div>
            <button className="font-semibold block mb-2 hover:text-logo transition" style={{ background: 'none', border: 'none', padding: 0 }} onClick={handleTumUrunler}>Tüm Ürünler</button>
            <ul className="text-gray-300 space-y-1">
              {categories.map((ad, i) => (
                <li key={i}>
                  <button className="hover:text-logo transition" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => handleKategoriSec(ad)}>{ad}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold block mb-2">İletişim</span>
            <ul className="text-gray-300 space-y-1">
              <li>📍 Bursa/Nilüfer</li>
              <li>📞 <a href="tel:+905079656645" className="hover:text-logo transition">+90 507 965 6645</a></li>
              <li>✉️ zeyalhediye@gmail.com</li>
              <li><a href="https://wa.me/905079656645" target="_blank" className="flex items-center gap-2 justify-center md:justify-start hover:text-green-600 transition mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.18-1.62A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.23-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.13-1.41l-.37-.22-3.67.96.98-3.58-.24-.37A9.93 9.93 0 1 1 12 22zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5h-.57c-.17 0-.45.07-.68.34-.23.27-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.75 4.37 3.74.61.21 1.09.33 1.46.42.61.15 1.16.13 1.6.08.49-.07 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.08-.13-.28-.2-.58-.35z"/>
                  </svg>Whatsapp&apos;tan Yaz.</a></li>
              <li>🕓 Pzt-Cum: 09:00-18:00</li>
            </ul>
          </div>
          <div>
            <span className="font-semibold block mb-2">Sosyal Medya</span>
            <ul className="text-gray-300">
            <li>
                <a href="https://instagram.com/zeyalatelier" target="_blank" rel="noopener noreferrer" className="hover:text-soft-yellow transition">Instagram/zeyalatelier</a>
                <div className="flex justify-center md:justify-start mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.13.54c-.77.24-1.42.56-2.07 1.21-.65.65-.97 1.3-1.21 2.07-.228.74-.412 1.64-.47 2.92C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.242 2.18.47 2.92.24.77.56 1.42 1.21 2.07.65.65 1.3.97 2.07 1.21.74.228 1.64.412 2.92.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.18-.242 2.92-.47.77-.24 1.42-.56 2.07-1.21.65-.65.97-1.3 1.21-2.07.228-.74.412-1.64.47-2.92.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.28-.242-2.18-.47-2.92-.24-.77-.56-1.42-1.21-2.07-.65-.65-1.3-.97-2.07-1.21-.74-.228-1.64-.412-2.92-.47C15.668.012 15.264 0 12 0zm0 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
                  </svg>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-4 text-center text-gray-400 text-xs">&copy; 2025 Zeyal Atelier. Tüm hakları saklıdır.</div>
      </footer>
    </div>
  );
}
