"use client";
import { useEffect, useRef, useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const safeImages = (Array.isArray(images) ? images : []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [transformOrigin, setTransformOrigin] = useState<string>("50% 50%");
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  useEffect(() => {
    if (index >= safeImages.length) setIndex(0);
  }, [safeImages.length, index]);

  function onMouseMove(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  }

  function prev() {
    setIndex((i) => (safeImages.length ? (i - 1 + safeImages.length) % safeImages.length : i));
  }
  function next() {
    setIndex((i) => (safeImages.length ? (i + 1) % safeImages.length : i));
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    didSwipeRef.current = false;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (didSwipeRef.current) return;
    const sx = touchStartXRef.current;
    const sy = touchStartYRef.current;
    if (sx == null || sy == null) return;
    const t = e.touches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 40;
    if (absDx > absDy && absDx > threshold) {
      didSwipeRef.current = true;
      if (dx < 0) next(); else prev();
    }
  }
  function onTouchEnd() {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    didSwipeRef.current = false;
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightbox) return;
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const current = safeImages[index] || "/placeholder.png";

  return (
    <div>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow bg-white cursor-zoom-in"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={onMouseMove}
        onClick={() => setLightbox(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={current}
          alt={name}
          className="w-full h-auto select-none"
          style={{ transform: hovered ? "scale(1.25)" : "scale(1)", transformOrigin, transition: hovered ? "transform 0.05s ease" : "transform 0.2s ease" }}
        />
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 rounded-full px-3 py-1 text-[11px] text-white">
            {index + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {safeImages.map((u, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}. görsel`}
              className={`border rounded-lg overflow-hidden shrink-0 ${index === i ? "ring-2 ring-[#969B38]" : ""}`}
            >
              <img src={u} alt="thumb" className="w-24 h-24 object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img src={current} alt={name} className="max-w-[95vw] max-h-[95vh] object-contain rounded" />
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Önceki"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Sonraki"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10"
                >
                  ›
                </button>
              </>
            )}
            <button
              onClick={() => setLightbox(false)}
              aria-label="Kapat"
              className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8 shadow"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 