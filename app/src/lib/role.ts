"use client";

/**
 * Rolul activ (cumpărător / vânzător) — decizia #39.
 * Se comută din Profil („Cumpăr | Vând") și se ține minte pe telefon
 * (localStorage). Shell-urile îl sincronizează cu ruta, ca navigarea directă
 * (ex. deschizi /producator din URL) să nu lase rolul în urmă.
 */
import { useSyncExternalStore } from "react";

export type Role = "buyer" | "seller";

const KEY = "piata.role";
const listeners = new Set<() => void>();

function snapshot(): Role {
  return typeof window !== "undefined" && window.localStorage.getItem(KEY) === "seller" ? "seller" : "buyer";
}

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEY) === r) return;
  window.localStorage.setItem(KEY, r);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

export function useRole(): Role {
  return useSyncExternalStore(subscribe, snapshot, () => "buyer");
}
