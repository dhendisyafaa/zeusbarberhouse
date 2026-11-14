"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { name: "Tentang Zeus", href: "/#about" },
  { name: "Barber", href: "/#barbers" },
  { name: "Menu", href: "/#pricelist" },
  { name: "Galeri", href: "/#gallery" },
  { name: "Cabang", href: "/#locations" },
  { name: "Kritik & Saran", href: "/#kritik" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="relative h-9 w-28">
          <Image
            src="/zeus-logo.jpg"
            alt="Zeus Barberhouse Logo"
            fill
            priority
            sizes="112px"
            className="object-contain opacity-85"
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/booking"
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover sm:inline-flex"
          >
            <Calendar className="h-3.5 w-3.5" />
            Booking
          </Link>
          <Link
            href="/account"
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground transition hover:border-primary sm:inline-flex"
          >
            <UserRound className="h-3.5 w-3.5" />
            Akun
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-border bg-card p-2.5 text-foreground transition hover:border-primary lg:hidden"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-card px-5 py-6 shadow-2xl sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border-b border-border/60 px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground transition hover:bg-hover hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/booking"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-full bg-primary py-3.5 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground"
            >
              Booking
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-border py-3.5 text-center text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Akun Member
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
