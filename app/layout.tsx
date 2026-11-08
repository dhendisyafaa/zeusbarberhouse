import type { Metadata } from "next";
import { AppQueryProvider } from "@/components/app-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeus BarberHouse | Feel at Home, Leave Refreshed",
  description:
    "Barbershop paling santai di Bandung Raya. Feel at home, leave refreshed.",
  icons: {
    icon: "/zeus-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#0033A0] selection:text-[#FAFAFA]">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
