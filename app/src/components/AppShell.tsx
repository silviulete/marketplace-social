"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "./ui/Icon";
import { BottomNav, type NavItem } from "./ui/BottomNav";
import { BUYER, NEIGHBORHOOD } from "@/lib/demo";
import { setRole } from "@/lib/role";

/**
 * Shell mobil-first: header fix + suprafața + bottom nav cu 3 taburi
 * (Comenzi · Chat centru · Profil), conform deciziei #17c.
 * Pe ecran lat, conținutul e centrat într-o coloană de telefon.
 */
export const BUYER_NAV: NavItem[] = [
  { href: "/comenzi", icon: "shopping_bag", label: "Comenzi" },
  { href: "/", icon: "chat_bubble", label: "Chat", center: true },
  { href: "/profil", icon: "person", label: "Profil" },
];

export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: ReactNode;
}) {
  // paginile cumpărătorului sincronizează rolul (#39) — navigarea directă contează
  useEffect(() => setRole("buyer"), []);

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <Header title={title} />
        <main className="flex-1 pt-[60px] pb-[150px]">{children}</main>
        <BottomNav items={BUYER_NAV} />
      </div>
    </div>
  );
}

function Header({ title }: { title?: ReactNode }) {
  return (
    <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
      <div className="h-[60px] px-md flex items-center">
        <div className="flex items-center gap-base min-w-0">
          <Icon name="spa" className="text-primary" size={24} filled />
          <div className="min-w-0">
            {title ?? (
              <>
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">
                  Bună, {BUYER.firstName} 👋
                </h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">
                  {NEIGHBORHOOD.name} · {NEIGHBORHOOD.activeProducers} producători activi
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
