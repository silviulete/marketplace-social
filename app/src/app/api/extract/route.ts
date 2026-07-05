import { NextResponse } from "next/server";
import { parseOffer } from "@/lib/extract";
import { parseRequest } from "@/lib/request";

/**
 * Extracția prin AI cloud (Etapa 11 — Google AI Studio, deciziile #41/#43).
 * Model implicit: `gemini-flash-lite-latest` (rapid ~0,6s, urmează formatul exact;
 * modelele Gemma din AI Studio s-au dovedit lente/verbose — vezi #43). Comutabil
 * prin `AI_MODEL`. Self-host Gemma (Ollama) rămâne opțiunea post-pilot (aceeași cusătură).
 *
 * Arhitectura respectă #7/#14: LLM-ul DOAR normalizează textul liber (rescrie
 * mesajul ca enumerare simplă); **numerele se extrag apoi determinist** cu
 * parserele existente (`extract.ts` / `request.ts`), NU de LLM. Hardening:
 *  - fără `GOOGLE_AI_API_KEY` → parsează direct (mock-server), app-ul merge la fel;
 *  - eroare/timeout model → parsează textul original;
 *  - normalizarea nu găsește nimic → tot textul original (nu pierdem niciodată).
 */

const MODEL = process.env.AI_MODEL ?? "gemini-flash-lite-latest";
const TIMEOUT_MS = 8000;

const PROMPTS = {
  offer:
    "Un fermier român descrie ce vinde. Rescrie mesajul lui ca o enumerare simplă, " +
    "câte un produs pe rând, în formatul: «<produs> <preț> lei <cantitate> <unitate>». " +
    "Dacă spune ziua de livrare, adaug-o la final pe un rând separat (ex. «livrez joi»). " +
    "COPIAZĂ numerele exact cum apar, nu calcula și nu inventa nimic. " +
    "Răspunde DOAR cu enumerarea, fără alte cuvinte.\n\nMesaj: ",
  request:
    "Un client român descrie ce vrea să cumpere. Rescrie mesajul lui ca o enumerare simplă " +
    "de produse cu cantități, în formatul: «<cantitate> <unitate> <produs>», separate prin virgulă. " +
    "Păstrează mențiunile de preț maxim (ex. «sub 30 lei») și de timp (ex. «până joi») la final. " +
    "COPIAZĂ numerele exact cum apar, nu calcula și nu inventa nimic. " +
    "Răspunde DOAR cu enumerarea, fără alte cuvinte.\n\nMesaj: ",
};

async function normalizeWithModel(kind: "offer" | "request", text: string, key: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPTS[kind] + text }] }],
        // maxOutputTokens = plasă contra unui model care „gândește" lung (#43)
        generationConfig: { temperature: 0, maxOutputTokens: 256 },
      }),
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    // păstrează structura pe linii (enumerarea) — join cu spații lega greșit cantitățile
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n").trim() || null;
  } catch {
    return null; // timeout / rețea → apelantul cade pe textul original
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let kind: "offer" | "request";
  let text: string;
  try {
    const body = (await req.json()) as { kind?: string; text?: string };
    if ((body.kind !== "offer" && body.kind !== "request") || !body.text?.trim()) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    kind = body.kind;
    text = body.text.trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const key = process.env.GOOGLE_AI_API_KEY;

  // DETERMINIST ÎNTÂI (#43): parserul e proba de aur (golden 40/40), instant și
  // gratuit — îl rulăm pe textul original. Chemăm modelul DOAR ca plasă, când
  // parserul nu prinde nimic (fraze încâlcite): normalizează → reparsează.
  if (kind === "offer") {
    let result = parseOffer(text);
    let provider = "deterministic";
    // „slab" = niciun produs SAU produse fără niciun preț (parserul a prins doar nume)
    const weak = result.products.length === 0 || result.products.every((p) => p.price === 0);
    if (weak && key) {
      const normalized = await normalizeWithModel("offer", text, key);
      const viaModel = normalized ? parseOffer(normalized) : null;
      if (viaModel && viaModel.products.some((p) => p.price > 0)) {
        result = viaModel;
        provider = `cloud:${MODEL}`;
      }
    }
    return NextResponse.json({ ok: true, provider, result });
  }

  let result = parseRequest(text);
  let provider = "deterministic";
  if (result.items.length === 0 && key) {
    const normalized = await normalizeWithModel("request", text, key);
    const viaModel = normalized ? parseRequest(normalized) : null;
    if (viaModel && viaModel.items.length > 0) {
      result = viaModel;
      provider = `cloud:${MODEL}`;
    }
  }
  return NextResponse.json({ ok: true, provider, result });
}
