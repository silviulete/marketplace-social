"use client";

/**
 * Suprafața de chat „dezgolită" (conform designului Stitch):
 * — fără bule; mesajul utilizatorului = text aliniat la dreapta;
 * — AI = iconiță verde mică + etichetă uppercase, apoi text/artefact.
 */
import { Icon } from "../ui/Icon";

/** Redă **bold** ușor (markdown minimal) cu accent verde. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="md-strong">
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-fade-in-up">
      <p className="max-w-[88%] text-right text-[15px] leading-snug text-on-surface">{text}</p>
    </div>
  );
}

export function AiHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-primary">
      <span className="w-6 h-6 rounded-pill bg-primary grid place-items-center shrink-0">
        <Icon name="bolt" size={14} className="text-on-primary" filled />
      </span>
      <span className="text-label-md uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function AiText({ label, text }: { label?: string; text?: string }) {
  return (
    <div className="flex flex-col items-start gap-2 animate-fade-in-up">
      {label && <AiHeader label={label} />}
      {text && (
        <p className="text-[15px] leading-relaxed text-on-surface">
          <RichText text={text} />
        </p>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 animate-fade-in-up">
      <span className="w-6 h-6 rounded-pill bg-primary grid place-items-center shrink-0">
        <Icon name="bolt" size={14} className="text-on-primary animate-pulse-soft" filled />
      </span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-pill bg-outline-variant animate-pulse-soft"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
    </div>
  );
}
