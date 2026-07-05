"use client";

/**
 * Bara de input (minimală, alb, bordură 1px) + chip-uri de sugestii deasupra.
 * În Etapa 1a totul e scriptat: orice trimitere/tap pe chip avansează scenariul.
 */
import { useState } from "react";
import { Icon } from "../ui/Icon";

export function Composer({
  suggestions,
  onSend,
  disabled,
  atEnd,
  endNote = "✓ Demo încheiat — ai cumpărat de la producătorul tău",
  placeholder = "Scrie ce cauți…",
}: {
  suggestions?: string[];
  onSend: (text: string) => void;
  disabled?: boolean;
  atEnd?: boolean;
  endNote?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit(text: string) {
    if (disabled) return;
    setValue("");
    onSend(text);
  }

  return (
    <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-phone px-md z-30">
      {/* chip-uri de sugestii */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 justify-end">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              disabled={disabled}
              className="px-3.5 py-2 rounded-pill bg-card border border-primary/40 text-primary text-[13px] font-medium shadow-art active:scale-95 transition-transform disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {atEnd && !suggestions?.length && (
        <div className="mb-2 flex justify-center">
          <span className="px-3 py-1.5 rounded-pill bg-chip-bg text-chip-text text-[12px] font-medium text-center">
            {endNote}
          </span>
        </div>
      )}

      {/* bara de input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) submit(value.trim());
          else onSend("");
        }}
        className="bg-card border border-card-border rounded-pill h-12 px-2 flex items-center gap-1 shadow-float"
      >
        <button type="button" className="w-9 h-9 grid place-items-center text-on-surface-variant" aria-label="Adaugă">
          <Icon name="add" size={22} />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? "…" : placeholder}
          className="flex-1 bg-transparent outline-none text-[15px] text-on-surface placeholder:text-outline/70"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-label="Trimite"
          className="w-10 h-10 rounded-pill bg-primary text-on-primary grid place-items-center shrink-0 active:scale-90 transition-transform disabled:opacity-40"
        >
          <Icon name="arrow_upward" size={22} filled />
        </button>
      </form>
    </div>
  );
}
