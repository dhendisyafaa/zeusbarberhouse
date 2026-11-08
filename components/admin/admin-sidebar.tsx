"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  Receipt,
  Scissors,
  ChevronRight,
  CalendarDays,
  Store,
  Users,
  Image as ImageIcon,
  BarChart3,
  BriefcaseBusiness,
  BadgeDollarSign,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  activeTab?: string;
}

export function AdminSidebar({
  activeTab = "dashboard-overview",
}: AdminSidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const signOut = async () => {
    setIsSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      queryClient.clear();
      setIsOpen(false);
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    {
      id: "dashboard-overview",
      label: "Dashboard Overview",
      icon: LayoutGrid,
      href: "/admin",
    },
  ];

  const resourceItems = [
    { id: "bookings", label: "Bookings", icon: Receipt, href: "/admin/bookings" },
    { id: "branches", label: "Branches", icon: Store, href: "/admin/branches" },
    { id: "services", label: "Services", icon: Scissors, href: "/admin/services" },
    { id: "barbers", label: "Barbers", icon: Users, href: "/admin/barbers" },
    { id: "schedules", label: "Schedules", icon: CalendarDays, href: "/admin/schedules" },
    { id: "haircut-models", label: "Haircut Models", icon: ImageIcon, href: "/admin/haircut-models" },
    { id: "reports", label: "Reports", icon: BarChart3, href: "/admin/reports" },
    { id: "membership", label: "Membership", icon: BadgeDollarSign, href: "/admin/membership" },
    { id: "payment-options", label: "Payment Options", icon: CreditCard, href: "/admin/payment-options" },
    { id: "career", label: "Career", icon: BriefcaseBusiness, href: "/admin/career" },
  ];

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={isOpen}
        aria-controls="admin-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed left-3 top-3 z-[60] inline-flex h-10 w-10 items-center justify-center border border-[#52525B] bg-[#09090B] text-[#FAFAFA] shadow-lg lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}
      <aside
        id="admin-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-[#27272A] bg-[#1A1A1D] select-none transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex flex-col">
        {/* Brand Bar */}
        <div className="flex h-16 items-center justify-between border-b border-[#27272A] bg-[#09090B] pl-14 pr-4 lg:px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 overflow-hidden border border-[#27272A] bg-[#09090B] shrink-0">
              <Image
                src="/zeus-logo.jpg"
                alt="Zeus BarberHouse"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg uppercase tracking-wider text-[#FAFAFA] font-bold">
                ZEUS
              </span>
              <span className="text-[10px] tracking-widest text-[#A1A1AA] uppercase font-semibold">
                HAIR GARAGE BDG
              </span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 bg-[#0033A0] text-[10px] font-bold uppercase text-[#FAFAFA] border border-[#0033A0] tracking-wider">
            HQ OPS
          </span>
        </div>

        {/* System Live Status */}
        <div className="px-4 py-2 border-b border-[#27272A] bg-[#0E0E10] flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase text-[#A1A1AA] tracking-wider">
            ADMIN WORKSPACE
          </span>
        </div>

        {/* Section Header */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] uppercase text-[#52525B] tracking-wider font-bold">
            OPERATIONAL CONSOLE
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col px-2 gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center justify-between px-3 py-2.5 transition-all text-left ${
                  isActive
                    ? "bg-[#0033A0] text-[#FAFAFA] font-semibold border-l-4 border-[#FF2A2A] shadow-[2px_2px_0px_0px_#0033A0]"
                    : "text-[#C4C5D5] hover:bg-[#2A2A2C] hover:text-[#FAFAFA] border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-current" />
                  <span className="text-xs uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? "text-[#FAFAFA]"
                      : "text-[#52525B] group-hover:text-[#FAFAFA]"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pt-5 pb-2">
          <span className="text-[10px] uppercase text-[#52525B] tracking-wider font-bold">
            RESOURCE MANAGEMENT
          </span>
        </div>
        <nav className="flex flex-col px-2 gap-1">
          {resourceItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center justify-between px-3 py-2.5 transition-all ${
                  isActive
                    ? "bg-[#0033A0] text-[#FAFAFA] font-semibold border-l-4 border-[#FF2A2A] shadow-[2px_2px_0px_0px_#0033A0]"
                    : "text-[#C4C5D5] hover:bg-[#2A2A2C] hover:text-[#FAFAFA] border-l-4 border-transparent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-current" />
                  <span className="text-xs uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-[#FAFAFA]" : "text-[#52525B] group-hover:text-[#FAFAFA]"}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#27272A] bg-[#09090B] flex flex-col gap-2">
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-[#52525B] uppercase font-mono font-medium">
            ADMIN CONSOLE
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={isSigningOut}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
        {signOutError && <p role="alert" className="text-xs text-red-300">{signOutError}</p>}
      </div>
      </aside>
    </>
  );
}
