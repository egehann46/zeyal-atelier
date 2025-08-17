"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
	id: string;
	name: string;
	description?: string;
	price?: number;
	image_url?: string;
	categories?: string[];
};

export default function AdminHome() {
	const [items, setItems] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch("/api/products", { cache: "no-store" });
				const json = await res.json();
				if (!res.ok) throw new Error(json?.error || "Hata");
				setItems(json.data || []);
			} catch (e: any) {
				setError(e?.message || "Bir hata oluştu");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Ürünler</h2>
				<Link href="/admin/new" className="px-3 py-2 rounded-md bg-[#969B38] text-white">Yeni Ürün</Link>
			</div>
			{loading && <div>Yükleniyor...</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && (
				<div className="overflow-x-visible md:overflow-x-auto">
					<table className="w-full text-sm table-fixed md:table-auto">
						<thead>
							<tr className="text-left border-b text-xs md:text-sm">
								<th className="py-2 pr-4">Ad</th>
								<th className="py-2 pr-4">Açıklama</th>
								<th className="py-2 pr-4">Fiyat</th>
								<th className="py-2 pr-4">Kategori</th>
								<th className="py-2">İşlem</th>
							</tr>
						</thead>
						<tbody>
							{items.map((p) => (
								<tr key={p.id} className="border-b align-top">
									<td className="py-2 pr-4">{p.name}</td>
									<td className="py-2 pr-4 text-gray-600 break-words">{p.description}</td>
									<td className="py-2 pr-4">{p.price?.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
									<td className="py-2 pr-4 break-words">{(p.categories || []).join(", ")}</td>
									<td className="py-2">
										<Link href={`/admin/${p.id}`} className="text-logo hover:underline">Düzenle</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
} 