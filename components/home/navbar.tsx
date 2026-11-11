"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Calendar, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckerboardDivider } from "./checkerboard-divider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Layanan & Harga", href: "/#layanan" },
  { name: "Capster", href: "/#capster" },
  { name: "Cabang", href: "/#cabang" },
  { name: "Model Rambut", href: "/haircut-models" },
  { name: "Membership", href: "/#membership" },
  { name: "Karier", href: "/careers" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden border border-border bg-background shrink-0">
            <Image
              src="/zeus-logo.jpg"
              alt="Zeus BarberHouse Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="whitespace-nowrap font-heading text-base font-bold uppercase tracking-wider text-foreground leading-none xl:text-lg 2xl:text-xl">
              ZEUS BARBERHOUSE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex min-w-0 flex-1 items-center justify-center gap-5 2xl:gap-8 h-full">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="whitespace-nowrap text-[11px] 2xl:text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden shrink-0 sm:flex items-center gap-2 xl:gap-3 2xl:gap-4">
          <ThemeToggle />
          <Link
            href="/account"
            className="w-10 h-10 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            title="Area Pelanggan"
          >
            <User className="w-4 h-4" />
          </Link>
          <Link
            href="/booking"
            className="whitespace-nowrap bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-3.5 2xl:px-6 border border-primary transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            BOOKING NOW
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-foreground border border-border bg-background focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Decorative Checkerboard Line Under Navbar */}
      <CheckerboardDivider />

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-card border-b border-border px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground py-2 border-b border-border/50"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <ThemeToggle showLabel />
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-3.5 border border-primary"
            >
              BOOKING JADWAL SEKARANG
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-background text-muted-foreground text-xs font-bold uppercase tracking-wider py-3 border border-border"
            >
              Masuk Akun Member
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
