import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import ProductGallery from "../ProductGallery";
import PurchaseActions from "../PurchaseActions";
import type { Metadata } from "next";

function currencyTRY(n: unknown): string | null {
  if (n == null) return null;
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = props?.params?.then ? await props.params : props?.params;
  const id: string | undefined = params?.id;
  if (!id) return { title: "Ürün | Zeyal Atelier" };
  const { data } = await supabaseAdmin
    .from("products")
    .select("name, description, price, image_url, image_urls")
    .eq("id", id)
    .single();
  const title = data?.name ? `${data.name} | Zeyal Atelier` : "Ürün | Zeyal Atelier";
  const description = data?.description || "Kintsugi, dokulu tablo ve mum yapım malzemeleri.";
  const img = (Array.isArray((data as any)?.image_urls) && (data as any).image_urls[0]) || data?.image_url || "/favicon-512x512.png";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: img }],
      type: "website",
    },
    alternates: { canonical: `/product/${id}` },
  };
}

export default async function ProductDetail(props: any) {
  const params = props?.params?.then ? await props.params : props?.params;
  const id: string = params?.id;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return <div className="max-w-5xl mx-auto p-6">Hata: {error.message}</div>;
  if (!data) return <div className="max-w-5xl mx-auto p-6">Ürün bulunamadı</div>;

  const imgs: string[] = Array.isArray((data as any).image_urls) ? (data as any).image_urls.filter(Boolean) : [];
  const primary = imgs[0] || data.image_url || "/placeholder.png";
  const allImages = [primary, ...imgs.filter(u => u !== primary)];
  const fiyat = currencyTRY(data.price) || undefined;
  const stockStr = ((data as any).stock ?? "").toString().trim();
  const isOutOfStock = stockStr === "0";

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: allImages,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: Number(data.price) || 0,
      availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/product/${(data as any).id}`,
    },
  };

  return (
    <div className="min-h-screen bg-white pt-12 md:pt-20">
      <div className="max-w-5xl mx-auto p-6 mt-0 md:mt-2">
        <Link href="/#tum-urunler" className="text-logo hover:underline">← Geri Dön</Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <ProductGallery images={allImages} name={data.name} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">{data.name}</h1>
            {fiyat && <div className="text-lg text-orange-600 font-bold mb-4">{fiyat}</div>}
            {data.description && <p className="text-gray-700 mb-6 whitespace-pre-wrap">{data.description}</p>}

            <div className="grid grid-cols-1 gap-3 mb-6">
              {data.dimensions && (
                <div><span className="font-semibold">Boyutlar: </span>{data.dimensions}</div>
              )}
              {data.color && (
                <div><span className="font-semibold">Renk: </span>{data.color}</div>
              )}
              {data.volume && (
                <div><span className="font-semibold">Hacim: </span>{data.volume}</div>
              )}
              {stockStr && (
                <div><span className="font-semibold">Stok: </span>{stockStr}</div>
              )}
              {Array.isArray(data.categories) && data.categories.length > 0 && (
                <div><span className="font-semibold">Kategori: </span>{data.categories.join(", ")}</div>
              )}
            </div>

            <PurchaseActions id={(data as any).id} name={data.name} price={Number(data.price) || 0} image={primary} disabled={isOutOfStock} />
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    </div>
  );
} 