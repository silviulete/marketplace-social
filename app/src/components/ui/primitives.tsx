/**
 * Primitive UI partajate, cu tokens-urile din designul Stitch.
 * Butoane: primar = verde pădure plin; secundar = contur 1px verde.
 * Carduri: alb, bordură 1px #e6e6e4, colț 16px. Chip-uri de status: pill pal.
 */
import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: string;
  className?: string;
}) {
  const base =
    "w-full h-12 rounded font-semibold text-[15px] flex items-center justify-center gap-base transition-all active:scale-[0.98] select-none";
  const styles =
    variant === "primary"
      ? "bg-primary text-on-primary shadow-art hover:opacity-95"
      : variant === "secondary"
        ? "border border-primary text-primary bg-card hover:bg-chip-bg/40"
        : "text-on-surface-variant hover:bg-surface-container";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

export function Chip({
  children,
  icon,
  tone = "neutral",
}: {
  children: ReactNode;
  icon?: string;
  tone?: "neutral" | "green";
}) {
  const styles =
    tone === "green"
      ? "bg-chip-bg text-chip-text"
      : "bg-surface-container text-on-surface-variant";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-label-md uppercase whitespace-nowrap shrink-0 ${styles}`}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

/** Thumbnail produs/producător: tile rotunjit cu emoji (fără imagini externe). */
export function Thumb({
  emoji,
  size = 48,
  className = "",
}: {
  emoji?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 rounded grid place-items-center bg-surface-container ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      <span aria-hidden="true">{emoji ?? "🧺"}</span>
    </div>
  );
}

/** Card-artefact: alb, bordură 1px, colț 16px, adâncime difuză. */
export function ArtifactCard({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-card rounded-card shadow-art overflow-hidden animate-fade-in-up ${
        highlight ? "border-2 border-primary" : "border border-card-border"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function MoneyRow({
  label,
  amount,
  strong = false,
  tone = "normal",
}: {
  label: ReactNode;
  amount: string;
  strong?: boolean;
  tone?: "normal" | "muted" | "green";
}) {
  const color =
    tone === "green" ? "text-secondary" : tone === "muted" ? "text-on-surface-variant" : "text-on-surface";
  return (
    <div className={`flex justify-between items-baseline ${strong ? "text-[16px] font-semibold" : "text-body-sm"} ${color}`}>
      <span>{label}</span>
      <span className={strong ? "text-primary" : ""}>{amount}</span>
    </div>
  );
}

export const lei = (n: number) => `${n} lei`;
