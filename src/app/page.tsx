"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// WhatsApp numarası (ülke koduyla, başında + olmadan). İstersen .env ile override edebilirsin
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905079656645";

// ---- Types
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  categories?: string[] | null;
  stock?: string | null;
};



function SafeImage({ src, alt, priority, sizes }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  const [ok, setOk] = useState(true);
  useEffect(() => { setOk(true); }, [src]);
  if (!src || !ok) {
    return <img src="/placeholder.png" alt={alt} className="object-contain w-full h-full" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="object-contain w-full h-full"
      onError={() => setOk(false)}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
    />
  );
}

// Tek bir ürün kartı: başlık kontrastı artırıldı; çoklu görsel için nokta/hover/kaydırma destekli
function ProductCard({ u, priority }: { u: { id?: string; ad: string; kategori: string; imgs: string[]; fiyat?: string; desc?: string; stock?: string | null }; priority: boolean }) {
  const [idx, setIdx] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDidSwipeRef = useRef(false);

  const handleNext = () => setIdx(i => (u.imgs.length ? (i + 1) % u.imgs.length : i));
  const handlePrev = () => setIdx(i => (u.imgs.length ? (i - 1 + u.imgs.length) % u.imgs.length : i));

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
    const threshold = 40;
    if (absDx > absDy && absDx > threshold) {
      touchDidSwipeRef.current = true;
      if (dx < 0) handleNext(); else handlePrev();
    }
  };
  const onTouchEnd = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDidSwipeRef.current = false;
  };

  const current = u.imgs[idx] || u.imgs[0] || "/placeholder.png";
  const isOutOfStock = (u.stock ?? "").toString().trim() === "0";

  return (
    <Link href={u.id ? `/product/${u.id}` : "#"} className="block" prefetch>
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col ${isOutOfStock ? "opacity-60" : ""}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="relative w-full h-80 md:h-72 bg-white">
          <div className="absolute inset-0">
            <img src={current} alt={u.ad} className="object-cover w-full h-full" loading={priority ? "eager" : "lazy"} />
          </div>
          {isOutOfStock && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
              <div className="bg-red-700/95 text-white text-center text-sm md:text-base font-extrabold uppercase tracking-wide py-3">
                Tükendi
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="h-16 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute left-0 right-0 bottom-0 p-3">
              <span className="font-abril md:text-xl text-base font-semibold text-white drop-shadow-md px-1">
                {u.ad}
              </span>
            </div>
          </div>
          {u.imgs.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {u.imgs.map((_, i) => (
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setIdx(i); } }}
                  onMouseEnter={() => setIdx(i)}
                  className={`w-3 h-3 rounded-full border-2 transition cursor-pointer ${idx === i ? "border-white bg-white" : "border-white/80 hover:border-white"}`}
                  style={{ backgroundClip: "padding-box" }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-gray-800 mb-3 flex-1 line-clamp-2 min-h-[40px]">{u.desc}</p>
          <div className="flex justify-between items-end mt-2">
            <span className="text-orange-600 font-bold text-base">{u.fiyat}</span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#969B38] text-white text-xs">Detayları Gör</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Array<{ id?: string; ad: string; kategori: string; imgs: string[]; fiyat?: string; desc?: string; stock?: string | null }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
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
    let cancelled = false;
    async function load() {
      try {
        setLoadError(null);
        setProductsLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `Yükleme hatası (${res.status})`);
        const list: Product[] = Array.isArray(json?.data) ? json.data : [];
        const cats = Array.from(new Set(list.flatMap(p => Array.isArray(p.categories) ? p.categories : []).filter(Boolean))).sort();
        if (!cancelled) setCategories(cats);
        const mapped = list.map(p => {
          const fiyat = p.price == null ? undefined : Number(p.price).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
          const imgsArr = Array.isArray((p as any).image_urls) ? ((p as any).image_urls as string[]).filter(Boolean) : [];
          const primaryImage = (imgsArr[0]) || p.image_url || "/placeholder.png";
          const imgs = [primaryImage, ...imgsArr.filter((u) => u !== primaryImage)];
          return {
            id: (p as any).id,
            ad: p.name || "Ürün",
            kategori: (Array.isArray(p.categories) && p.categories[0]) ? p.categories[0] : "Diğer",
            imgs,
            fiyat,
            desc: p.description || undefined,
            stock: (p as any).stock ?? null,
          };
        });
        if (!cancelled) setProducts(mapped);
        if (!cancelled) setProductsLoading(false);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Veri yüklenemedi");
        if (!cancelled) setProductsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {loadError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-red-600 text-white text-sm px-3 py-2 rounded">
            {loadError}
          </div>
        )}
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
          {productsLoading && (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="w-full h-80 md:h-72 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-8 bg-gray-300 rounded w-1/3 ml-auto" />
                </div>
              </div>
            ))
          )}
          {!productsLoading && filtered.map((u, i) => (
            <ProductCard key={i} u={u as any} priority={i === 0} />
          ))}
        </div>
        {!productsLoading && filtered.length === 0 && <div className="text-center text-gray-500 mt-10">Bu kategoride ürün bulunamadı.</div>}
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
                    <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.13.54c-.77.24-1.42.56-2.07 1.21-.65.65-.97 1.3-1.21 2.07-.228.74-.412 1.64-.47 2.92C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.242 2.18.47 2.92.24.77.56 1.42 1.21 2.07.65.65 1.3.97 2.07 1.21.74.228 1.64.412 2.92.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.18-.242 2.92-.47.77-.24 1.42-.56 2.07-1.21.65-.65 1.3-.97 2.07-1.21-.74-.228-1.64-.412-2.92-.47C15.668.012 15.264 0 12 0zm0 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
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
