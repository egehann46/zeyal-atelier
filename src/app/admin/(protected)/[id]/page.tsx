"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProduct() {
	const r = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id as string;

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState<string>("");
	const [images, setImages] = useState<string[]>([]); // existing URLs
	const [localFiles, setLocalFiles] = useState<File[]>([]); // pending files
	const [localPreviews, setLocalPreviews] = useState<string[]>([]);
	const [categories, setCategories] = useState<string>("");
	const [dimensions, setDimensions] = useState<string>("");
	const [color, setColor] = useState<string>("");
	const [volume, setVolume] = useState<string>("");
	const [stock, setStock] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement | null>(null);

	const removePreview = (idx: number) => {
		setLocalFiles((arr) => arr.filter((_, i) => i !== idx));
		setLocalPreviews((arr) => arr.filter((_, i) => i !== idx));
	};

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch("/api/products", { cache: "no-store" });
				const json = await res.json();
				if (!res.ok) throw new Error(json?.error || "Hata");
				const item = (json.data || []).find((x: any) => String(x.id) === String(id));
				if (item) {
					setName(item.name || "");
					setDescription(item.description || "");
					setPrice(item.price != null ? String(item.price) : "");
					const arr: string[] = Array.isArray(item.image_urls) ? item.image_urls : [];
					if (!arr.length && item.image_url) arr.push(item.image_url);
					setImages(arr);
					setCategories((item.categories || []).join(", "));
					setDimensions(item.dimensions || "");
					setColor(item.color || "");
					setVolume(item.volume || "");
					setStock(item.stock != null ? String(item.stock) : "");
				}
			} catch (e: any) {
				setError(e?.message || "Bir hata oluştu");
			} finally {
				setLoading(false);
			}
		}
		if (id) load();
	}, [id]);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = e.target.files ? Array.from(e.target.files) : [];
		if (!files.length) return;
		setError(null);
		const previews: string[] = [];
		for (const f of files) previews.push(await fileToDataUrl(f));
		setLocalFiles((arr) => [...arr, ...files]);
		setLocalPreviews((arr) => [...arr, ...previews]);
		if (fileRef.current) fileRef.current.value = "";
	}

	async function uploadPending(): Promise<string[]> {
		if (!localFiles.length) return [];
		setUploading(true);
		try {
			const urls: string[] = [];
			for (const file of localFiles) {
				const fd = new FormData();
				fd.append("file", file);
				const res = await fetch("/api/upload", { method: "POST", body: fd });
				const json = await res.json();
				if (!res.ok) throw new Error(json?.error || "Yükleme hatası");
				urls.push(json.url);
			}
			return urls;
		} finally {
			setUploading(false);
		}
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			const uploaded = await uploadPending();
			const allUrls = Array.from(new Set([...(images || []), ...uploaded]));
			const res = await fetch(`/api/products/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					description,
					price: price ? Number(price) : null,
					image_url: allUrls[0] || null,
					image_urls: allUrls,
					categories: categories ? categories.split(",").map((s) => s.trim()).filter(Boolean) : [],
					dimensions: dimensions || null,
					color: color || null,
					volume: volume || null,
					stock: stock === "" ? null : stock,
				}),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || "Kaydetme hatası");
			r.push("/admin");
		} catch (e: any) {
			setError(e?.message || "Hata");
		} finally {
			setSaving(false);
		}
	}

	async function onDelete() {
		if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
		setSaving(true);
		try {
			const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || "Silme hatası");
			r.push("/admin");
		} catch (e: any) {
			setError(e?.message || "Hata");
		} finally {
			setSaving(false);
		}
	}

	if (loading) return <div>Yükleniyor...</div>;

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-sm mb-1">Ad</label>
				<input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Açıklama</label>
				<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div>
					<label className="block text-sm mb-1">Fiyat (TRY)</label>
					<input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded px-3 py-2" type="number" step="0.01" />
				</div>
				<div>
					<label className="block text-sm mb-1">Stok</label>
					<input value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Örn: 99+" />
				</div>
				<div>
					<label className="block text-sm mb-1">Boyutlar</label>
					<input value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Örn: 20x30 cm" />
				</div>
				<div>
					<label className="block text-sm mb-1">Hacim</label>
					<input value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Örn: 500 ml" />
				</div>
			</div>
			<div>
				<label className="block text-sm mb-1">Renk</label>
				<input value={color} onChange={(e) => setColor(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Örn: Beyaz" />
			</div>
			<div>
				<label className="block text-sm mb-1">Görseller</label>
				<div className="flex items-center gap-3">
					<input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
					<button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-md bg-[#111827] text-white hover:bg-[#1f2937] transition text-sm">
						Görsel(ler)i Seç
					</button>
					{uploading && <div className="text-sm text-gray-500">Yükleniyor...</div>}
				</div>
				<div className="mt-3 flex flex-wrap gap-2">
					{images.map((u) => (
						<div key={u} className="relative">
							<img src={u} alt="img" className="w-24 h-24 object-cover rounded" />
						</div>
					))}
					{localPreviews.map((u, idx) => (
						<div key={`${u}-${idx}`} className="relative">
							<img src={u} alt="preview" className="w-24 h-24 object-cover rounded" />
							<button type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6" onClick={() => removePreview(idx)}>×</button>
						</div>
					))}
				</div>
			</div>
			<div>
				<label className="block text-sm mb-1">Kategoriler (virgülle ayır)</label>
				<input value={categories} onChange={(e) => setCategories(e.target.value)} className="w-full border rounded px-3 py-2" />
			</div>
			{error && <div className="text-red-600">{error}</div>}
			<div className="flex gap-3">
				<button disabled={saving} className="px-3 py-2 rounded bg-[#969B38] text-white">Kaydet</button>
				<button type="button" onClick={onDelete} disabled={saving} className="px-3 py-2 rounded bg-red-600 text-white">Sil</button>
			</div>
		</form>
	);
}

async function fileToDataUrl(file: File): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
} 