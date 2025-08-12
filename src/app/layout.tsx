// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Dancing_Script } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: "400", variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "Zeyal Atelier | El Yapımı Workshoplar",
  description: "Doğal malzemelerle atölye deneyimi, sanat ve topluluk Zeyal Atelier'de buluşuyor.",
  icons: {
    icon: [
      { url: "/favicon.ico" }, // mevcut .ico yerinde kalsın
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${poppins.variable} ${dancing.variable}`}>
      <body className="bg-[#FAF6F1]">{children}</body>
    </html>
  );
}
