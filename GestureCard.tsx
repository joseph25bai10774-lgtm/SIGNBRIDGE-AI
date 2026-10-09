import HandSVG from "./HandSVG";
import type { Gesture } from "../data/gestures";
import { Volume2 } from "lucide-react";

const VIEWS = [
  { key: "view-front", label: "Front View" },
  { key: "view-side", label: "Side View" },
  { key: "view-back", label: "Back View" },
  { key: "view-angled", label: "Angled View" },
] as const;

export default function GestureCard({
  gesture,
  active,
  onSelect,
  onSpeak,
}: {
  gesture: Gesture;
  active?: boolean;
  onSelect: (g: Gesture) => void;
  onSpeak: (g: Gesture) => void;
}) {
  return (
    <article
      className={`card-hover group relative flex flex-col rounded-lg border bg-card p-3 ${
        active ? "border-pulse ring-pulse" : "border-cardline"
      }`}
    >
      {active && (
        <span className="absolute -top-2.5 right-3 z-10 rounded-full bg-pulse px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-abyss">
          Detected
        </span>
      )}
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[15px] font-bold uppercase tracking-wide text-inkcard">
            {gesture.name}
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug text-inkbody/90">{gesture.blurb}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSpeak(gesture); }}
          aria-label={`Hear the reply for ${gesture.name}`}
          className="mt-0.5 shrink-0 rounded-md border border-cardline p-1.5 text-inkdim opacity-70 transition hover:border-pulse hover:text-pulse hover:opacity-100"
        >
          <Volume2 size={13} />
        </button>
      </header>

      <div className="grid grid-cols-4 gap-1.5">
        {VIEWS.map((v) => (
          <figure key={v.key} className="flex flex-col">
            <div className="tile-studio relative aspect-[3/4] overflow-hidden rounded-[4px] shadow-inner">
              <div className={`absolute inset-0 flex items-end justify-center ${v.key} transition-transform duration-500 group-hover:scale-[1.04]`}>
                <HandSVG pose={gesture.pose} className="h-[92%] w-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]" />
              </div>
            </div>
            <figcaption className="mt-1 text-center text-[9.5px] font-medium text-inkbody/85">
              {v.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        onClick={() => onSelect(gesture)}
        className="mt-2.5 rounded-md border border-transparent bg-deep/60 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim transition hover:border-cardline hover:text-inkcard"
      >
        Deep explanation →
      </button>
    </article>
  );
}
