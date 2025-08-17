"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingCart as CartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart/CartContext";

export default function Header() {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { totalQuantity, open: openCart, totalPrice } = useCart();
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		let cancelled = false;
		async function loadCats() {
			try {
				const res = await fetch("/api/products", { cache: "no-store" });
				const json = await res.json().catch(() => ({}));
				if (!res.ok) return;
				const list: Array<{ categories?: string[] | null }> = Array.isArray(json?.data) ? json.data : [];
				const cats = Array.from(new Set(list.flatMap(p => Array.isArray(p.categories) ? p.categories : []).filter(Boolean))).sort();
				if (!cancelled) setCategories(cats as string[]);
			} catch {
				// sessizce geç
			}
		}
		loadCats();
		return () => { cancelled = true; };
	}, []);

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
		<header className="relative w-full sticky top-0 left-0 z-30 bg-[#F5F5DC] shadow-md h-16 md:h-20 flex items-center border-b border-gray-200">
			<div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center md:flex md:justify-between pl-3 pr-3 md:pl-6 md:pr-8">
				<div className="flex items-center gap-2 md:gap-3 col-start-1">
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
				{/* Mobil küçük nav */}
				<div className="col-start-2 flex items-center justify-center md:hidden">
					<nav className="flex gap-4 text-[#4f4f4f] font-poppins font-semibold text-sm whitespace-nowrap">
						<Link href="/#hero" className="hover:text-logo transition">Anasayfa</Link>
						<Link href="/#tum-urunler" className="hover:text-logo transition">Tüm Ürünler</Link>
					</nav>
				</div>
				<div className="flex items-center gap-2 md:gap-6 col-start-3 justify-end">
					{/* Masaüstü nav - hamburger menünün yanına */}
					<nav className="hidden md:flex items-center gap-2">
						<Link
							href="/#hero"
							className="px-3 py-2 rounded-md text-base font-semibold text-[#4f4f4f] hover:bg-[#F5F5DC] hover:text-logo transition"
						>
							Anasayfa
						</Link>
						<Link
							href="/#tum-urunler"
							className="px-3 py-2 rounded-md text-base font-semibold text-[#4f4f4f] hover:bg-[#F5F5DC] hover:text-logo transition"
						>
							Tüm Ürünler
						</Link>
					</nav>
					<button
						ref={buttonRef}
						className={`p-1.5 md:p-2 rounded-md hover:bg-[#F5F5DC] transition ${open ? "bg-[#F5F5DC] ring-2 ring-[#969B38]" : ""}`}
						aria-label="Menüyü Aç"
						onClick={e => {
							e.stopPropagation();
							setOpen(x => !x);
						}}
					>
						<Menu size={24} />
					</button>
					<button
						onClick={openCart}
						className="relative flex items-center gap-1 pl-1.5 pr-2 md:pl-2 md:gap-2 md:pr-3 py-1.5 md:py-2 rounded-md bg-[#969B38] text-white hover:bg-[#7f8430] transition"
						aria-label="Sepeti Aç"
						title="Sepet"
					>
						<CartIcon size={16} className="md:size-[18px]" />
						<span className="hidden sm:inline text-xs opacity-90">{totalPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
						{totalQuantity > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
								{totalQuantity}
							</span>
						)}
					</button>
				</div>
			</div>
			<div
				ref={menuRef}
				className={`fixed right-3 md:right-8 top-16 md:top-20 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 transition-all duration-200 ease-out
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
				style={{ minWidth: "220px" }}
			>
				<div className="p-4 border-b font-semibold text-[#969B38] text-lg">Menu</div>
				<ul className="flex flex-col">
					<li>
						<Link
							href="/#tum-urunler"
							className="block px-6 py-3 hover:bg-[#F5F5DC] hover:text-logo transition text-[#363636]"
							onClick={() => setOpen(false)}
						>
							Tüm Ürünler
						</Link>
					</li>
					{categories.length > 0 && (
						<li className="px-6 py-2 text-xs uppercase tracking-wide text-gray-400">Kategoriler</li>
					)}
					{categories.map(cat => (
						<li key={cat}>
							<Link
								href={`/?cat=${encodeURIComponent(cat)}#tum-urunler`}
								className="block px-6 py-2 hover:bg-[#F5F5DC] hover:text-logo transition text-[#363636]"
								onClick={() => setOpen(false)}
							>
								{cat}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</header>
	);
} 