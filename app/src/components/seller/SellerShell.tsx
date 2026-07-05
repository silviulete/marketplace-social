"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "../ui/Icon";
import { BottomNav, type NavItem } from "../ui/BottomNav";
import { SELLER } from "@/lib/seller-demo";
import { setRole } from "@/lib/role";

export const SELLER_NAV: NavItem[] = [
  { href: "/producator/comenzi", icon: "shopping_bag", label: "Comenzi" },
  { href: "/producator", icon: "storefront", label: "Taraba", center: true },
  { href: "/profil", icon: "person", label: "Profil" },
];

/**
 * Shell-ul vânzătorului (Taraba). Header cu identitatea fermei + nav minim:
 * Comenzi · Taraba (centru) · Profil. Întoarcerea la piață se face din
 * Profil, prin comutatorul „Cumpăr | Vând" (#39).
 */
export function SellerShell({ children }: { children: ReactNode }) {
  // paginile vânzătorului sincronizează rolul (#39) — navigarea directă contează
  useEffect(() => setRole("seller"), []);

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center">
            <div className="flex items-center gap-base min-w-0">
              <span className="w-7 h-7 rounded-pill bg-primary grid place-items-center shrink-0">
                <Icon name="storefront" className="text-on-primary" size={16} filled />
              </span>
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">
                  Taraba · {SELLER.farm}
                </h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">
                  {SELLER.firstName} · {SELLER.neighborhood}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-[150px]">{children}</main>

        <BottomNav items={SELLER_NAV} />
      </div>
    </div>
  );
}
