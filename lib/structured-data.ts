import { absoluteUrl, siteConfig } from "@/lib/site-config";

type BranchInput = {
  slug: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  mapsUrl: string | null;
  schedules: { dayOfWeek: number; open: string; close: string }[];
};

type ServiceInput = {
  name: string;
  description: string | null;
  priceRupiah: number;
  durationMinutes: number;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function buildSiteStructuredData({
  branches = [],
  services = [],
}: {
  branches?: BranchInput[];
  services?: ServiceInput[];
}) {
  const organizationId = `${siteConfig.url}/#organization`;
  const websiteId = `${siteConfig.url}/#website`;
  const sameAs = Array.from(
    new Set(
      Object.values(siteConfig.social).filter(
        (value): value is string =>
          typeof value === "string" && /^https?:\/\//i.test(value),
      ),
    ),
  );

  const phoneNumbers = Array.from(
    new Set(
      branches
        .map((branch) => branch.phone)
        .filter((phone): phone is string => Boolean(phone)),
    ),
  );

  const contactPoints = phoneNumbers.map((phone) => ({
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "reservations",
    areaServed: "ID",
    availableLanguage: ["id"],
  }));

  const organization = {
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.logo),
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(contactPoints.length > 0 ? { contactPoint: contactPoints } : {}),
    ...(services.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            "@id": `${siteConfig.url}/#services`,
            name: `Layanan ${siteConfig.name}`,
            itemListElement: services.map((service, index) => ({
              "@type": "Offer",
              position: index + 1,
              price: service.priceRupiah,
              priceCurrency: "IDR",
              availability: "https://schema.org/InStock",
              url: absoluteUrl("/services"),
              itemOffered: {
                "@type": "Service",
                name: service.name,
                ...(service.description
                  ? { description: service.description }
                  : {}),
                serviceType: "Haircut & grooming",
                provider: { "@id": organizationId },
                ...(service.durationMinutes > 0
                  ? {
                      termsOfService: `Durasi layanan ${service.durationMinutes} menit`,
                    }
                  : {}),
              },
            })),
          },
        }
      : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "id-ID",
    publisher: { "@id": organizationId },
  };

  const locations = branches.map((branch) => ({
    "@type": "HairSalon",
    "@id": `${siteConfig.url}/#branch-${branch.slug}`,
    name: `${siteConfig.name} ${branch.name}`,
    url: absoluteUrl("/branches"),
    image: absoluteUrl(siteConfig.logo),
    ...(branch.phone ? { telephone: branch.phone } : {}),
    ...(branch.mapsUrl ? { hasMap: branch.mapsUrl } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.city,
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
    areaServed: "Bandung Raya",
    priceRange: "Rp",
    currenciesAccepted: "IDR",
    parentOrganization: { "@id": organizationId },
    ...(branch.schedules.length > 0
      ? {
          openingHoursSpecification: branch.schedules.map((schedule) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: dayNames[schedule.dayOfWeek] ?? "Monday",
            opens: schedule.open,
            closes: schedule.close,
          })),
        }
      : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, ...locations],
  };
}
