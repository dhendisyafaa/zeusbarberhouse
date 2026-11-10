import type { Metadata } from "next";
import { AppQueryProvider } from "@/components/app-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="id" className="dark h-full antialiased" suppressHydrationWarning>
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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="zeus-theme"
        >
          <AppQueryProvider>{children}</AppQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
