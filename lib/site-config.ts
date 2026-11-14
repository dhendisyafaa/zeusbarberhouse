const fallbackSiteUrl = "https://www.zeusbarber.my.id";

export const siteConfig = {
  name: "Zeus BarberHouse",
  shortName: "Zeus BarberHouse",
  tagline: "Feel at Home, Leave Refreshed",
  description:
    "Barbershop paling santai di Bandung Raya. Booking online, pilih capster andalan, dan nikmati potongan presisi dengan harga transparan. Feel at home, leave refreshed.",
  url: (process.env.NEXT_PUBLIC_APP_URL || fallbackSiteUrl).replace(/\/$/, ""),
  locale: "id_ID",
  language: "id",
  logo: "/zeus-logo.jpg",
  ogImage: "/opengraph-image",
  keywords: [
    "barbershop Bandung",
    "barber Bandung",
    "potong rambut Bandung",
    "barbershop Bandung Raya",
    "booking barbershop online",
    "Zeus BarberHouse",
    "haircut Bandung",
    "capster Bandung",
    "grooming pria Bandung",
    "model rambut pria",
  ],
  social: {
    instagram: process.env.NEXT_PUBLIC_IG_URL,
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL,
    whatsapp: process.env.NEXT_PUBLIC_WA_URL,
    facebook: process.env.NEXT_PUBLIC_FB_URL,
  },
} as const;

export const siteVerification = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
} as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
