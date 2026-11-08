"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Calendar, User } from "lucide-react";
import { CheckerboardDivider } from "./checkerboard-divider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Layanan & Harga", href: "/#layanan" },
  { name: "Cabang", href: "/#cabang" },
  { name: "Model Rambut", href: "/haircut-models" },
  { name: "Membership", href: "/#membership" },
  { name: "Karier", href: "/careers" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#1A1A1D]/95 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden border border-[#27272A] bg-[#09090B] shrink-0">
            <Image
              src="/zeus-logo.jpg"
              alt="Zeus BarberHouse Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#FAFAFA] leading-none">
              ZEUS BARBERHOUSE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors py-2 border-b-2 border-transparent hover:border-[#0033A0]"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/account"
            className="w-10 h-10 border border-[#27272A] bg-[#09090B] flex items-center justify-center text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#0033A0] transition-colors"
            title="Area Pelanggan"
          >
            <User className="w-4 h-4" />
          </Link>
          <Link
            href="/booking"
            className="bg-[#0033A0] text-[#FAFAFA] text-xs font-bold uppercase tracking-wider px-6 py-3.5 border border-[#0033A0] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#FAFAFA] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            BOOKING NOW
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#FAFAFA] border border-[#27272A] bg-[#09090B] focus:outline-none cursor-pointer"
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
        <div className="lg:hidden bg-[#1A1A1D] border-b border-[#27272A] px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA] hover:text-[#FAFAFA] py-2 border-b border-[#27272A]/50"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#0033A0] text-[#FAFAFA] text-xs font-bold uppercase tracking-wider py-3.5 border border-[#0033A0]"
            >
              BOOKING JADWAL SEKARANG
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#09090B] text-[#A1A1AA] text-xs font-bold uppercase tracking-wider py-3 border border-[#27272A]"
            >
              Masuk Akun Member
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
