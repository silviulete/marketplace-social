/**
 * Cusătura `ModelProvider` (decizia #14): AI-ul stă în spatele acestei interfețe.
 * - `mockModelProvider` — parserele deterministe direct în client (default în dev).
 * - `cloudModelProvider` (Etapa 11, deciziile #41/#43) — trece prin `/api/extract`:
 *   modelul cloud (Google AI Studio, implicit `gemini-flash-lite-latest`) normalizează
 *   textul pe server, apoi ACELEAȘI parsere deterministe extrag numerele (#7). Orice
 *   eroare → cade pe mock, fără să se vadă.
 * Comutarea = `NEXT_PUBLIC_MODEL_PROVIDER=cloud` (+ `GOOGLE_AI_API_KEY` pe server).
 */
import { parseOffer, type ExtractionResult } from "./extract";
import { parseRequest, type RequestExtraction } from "./request";

export type { ExtractionResult, RequestExtraction };

export interface ModelProvider {
  name: string;
  /** Vânzător: extrage oferta din text liber. Numere deterministe (extract.ts). */
  extractOffer(text: string): Promise<ExtractionResult>;
  /** Cumpărător: structurează cererea din text liber. Numere deterministe (request.ts). */
  extractRequest(text: string): Promise<RequestExtraction>;
}

/** Provider mock: parserele deterministe + o mică latență simulată. */
export const mockModelProvider: ModelProvider = {
  name: "mock",
  async extractOffer(text: string) {
    await new Promise((r) => setTimeout(r, 500));
    return parseOffer(text);
  },
  async extractRequest(text: string) {
    await new Promise((r) => setTimeout(r, 500));
    return parseRequest(text);
  },
};

async function callExtract<T>(kind: "offer" | "request", text: string): Promise<T> {
  const r = await fetch("/api/extract", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, text }),
  });
  if (!r.ok) throw new Error(`extract ${r.status}`);
  const data = (await r.json()) as { ok: boolean; result: T };
  if (!data.ok) throw new Error("extract failed");
  return data.result;
}

/** Provider cloud: normalizare pe server (model Google AI) + parsare deterministă; fallback mock. */
export const cloudModelProvider: ModelProvider = {
  name: "cloud",
  async extractOffer(text: string) {
    try {
      return await callExtract<ExtractionResult>("offer", text);
    } catch {
      return mockModelProvider.extractOffer(text);
    }
  },
  async extractRequest(text: string) {
    try {
      return await callExtract<RequestExtraction>("request", text);
    } catch {
      return mockModelProvider.extractRequest(text);
    }
  },
};

/** Selectorul de provider — comutarea la cloud e o variabilă de mediu (#14). */
export function getModelProvider(): ModelProvider {
  return process.env.NEXT_PUBLIC_MODEL_PROVIDER === "cloud" ? cloudModelProvider : mockModelProvider;
}
