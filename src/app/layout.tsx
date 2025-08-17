// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Dancing_Script } from "next/font/google";
import { CartProvider } from "./cart/CartContext";
import CartSheet from "./cart/CartSheet";
import HeaderGate from "./HeaderGate";
import SeoJsonLd from "./seo/SeoJsonLd";
import { ToastProvider } from "./toast/ToastProvider";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: "400", variable: "--font-dancing" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Zeyal Atelier";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sanatı Eve Taşıyan Özgür Malzemeler Ve Sanat Kitleri",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Bursa Nilüfer'de atölyesi bulunan Zeyal Atelier'de kintsugi, dokulu tablo ve mum yapım malzemeleri. Türkiye'nin her yerine hızlı gönderim.",
  keywords: [
    "kintsugi malzemeleri",
    "kintsugi seti",
    "dokulu tablo malzemeleri",
    "mum yapım malzemeleri",
    "soya balmumu",
    "epoksi",
    "sanat atölyesi Bursa Nilüfer",
    "el sanatları malzemeleri",
    "hobi malzemeleri",
    "toptan hobi malzemeleri",
    "perakende hobi malzemeleri",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Sanatı Eve Taşıyan Özgür Malzemeler Ve Sanat Kitleri",
    description: "Kintsugi, dokulu tablo ve mum yapım malzemeleri. Türkiye geneli kargo.",
    images: [
      { url: "/favicon-512x512.png", width: 512, height: 512, alt: SITE_NAME },
    ],
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanatı Eve Taşıyan Özgür Malzemeler Ve Sanat Kitleri",
    description: "Kintsugi, dokulu tablo ve mum yapım malzemeleri. Türkiye geneli kargo.",
    images: ["/favicon-512x512.png"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${poppins.variable} ${dancing.variable}`}>
      <body className="bg-[#FAF6F1]">
        <CartProvider>
          <ToastProvider>
            <HeaderGate />
            <SeoJsonLd />
            {children}
            <CartSheet />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
