import "./globals.css";
import { Abril_Fatface, Inter } from "next/font/google";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { Dancing_Script } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: "400", variable: "--font-dancing" });


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${poppins.variable} ${dancing.variable}`}>
      <body className="bg-[#FAF6F1]">{children}</body>
    </html>
  );
}

export const metadata = {
  title: "Zeyal Atelier | El Yapımı Workshoplar",
  description: "Doğal malzemelerle atölye deneyimi, sanat ve topluluk Zeyal Atelier'de buluşuyor.",
};

