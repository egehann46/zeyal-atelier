"use client";

export default function SeoJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zeyalatelier.com";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Zeyal Atelier",
    url: siteUrl,
    logo: `${siteUrl}/favicon-512x512.png`,
    telephone: "+90 507 965 6645",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nilüfer",
      addressRegion: "Bursa",
      addressCountry: "TR",
    },
    sameAs: [
      "https://instagram.com/zeyalatelier",
    ],
    areaServed: "TR",
    makesOffer: {
      "@type": "Offer",
      category: ["hobi malzemeleri", "el sanatları", "kintsugi", "dokulu tablo", "mum yapım malzemeleri", "toptan", "perakende"],
      availability: "https://schema.org/InStock",
    },
  } as const;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zeyal Atelier",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
} 
