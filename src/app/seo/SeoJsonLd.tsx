"use client";

export default function SeoJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zeyal Atelier",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://zeyalatelier.com",
    logo: "/favicon-512x512.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nilüfer",
      addressRegion: "Bursa",
      addressCountry: "TR",
    },
    sameAs: [
      "https://instagram.com/zeyalatelier",
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
  );
} 
