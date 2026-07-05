"use client";

/**
 * Bara de navigație de jos — stil inspirat din vizualul fondatorului:
 * butonul central = squircle verde cu iconiță + etichetă în interior;
 * lateralele = iconiță + etichetă direct pe fundal (fără container/pill).
 * Folosită identic de shell-ul cumpărătorului și al vânzătorului.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  center?: boolean;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <nav className="fixed bottom-0 z-40 w-full max-w-phone bg-background">
      <div className="flex items-end justify-around px-md pt-2 pb-md">
        {items.map((it) =>
          it.center ? (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-art bg-primary text-on-primary shadow-art active:scale-95 transition-transform"
            >
              <Icon name={it.icon} size={24} filled />
              <span className="text-[11px] font-semibold leading-none">{it.label}</span>
            </Link>
          ) : (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-1 pb-1 ${
                isActive(it.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon name={it.icon} size={24} filled={isActive(it.href)} />
              <span className="text-[11px] font-medium leading-none">{it.label}</span>
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
