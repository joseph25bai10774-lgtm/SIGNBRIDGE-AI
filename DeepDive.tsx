import { useEffect } from "react";
import { X, Volume2, Move3D, MapPin, Compass, Hand, Brain, AlertTriangle, MessageCircleHeart } from "lucide-react";
import type { Gesture } from "../data/gestures";
import { speak } from "../lib/recognition";
import HandSVG from "./HandSVG";

const ROWS = [
  { key: "handshape", icon: Hand, label: "Handshape", tone: "text-pulse" },
  { key: "movement", icon: Move3D, label: "Movement", tone: "text-good" },
  { key: "location", icon: MapPin, label: "Location", tone: "text-warn" },
  { key: "orientation", icon: Compass, label: "Orientation", tone: "text-inkcard" },
] as const;

export default function DeepDive({ gesture, onClose }: { gesture: Gesture | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!gesture) return null;
  const d = gesture.deep;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-abyss/85 backdrop-blur-sm" onClick={onClose} />
      <div className="toast-in relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-cardline-bright bg-panel shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cardline bg-panel/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-inkdim">{gesture.category} · deep explanation</p>
            <h3 className="font-display text-2xl font-extrabold uppercase text-inkcard">{gesture.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => speak(gesture.voice)} aria-label="Hear reply" className="rounded-lg border border-cardline p-2 text-inkdim transition hover:border-pulse hover:text-pulse">
              <Volume2 size={16} />
            </button>
            <button onClick={onClose} aria-label="Close" className="rounded-lg border border-cardline p-2 text-inkdim transition hover:border-bad hover:text-bad">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
          <div className="space-y-3">
            <div className="tile-studio flex aspect-[3/4] items-end justify-center overflow-hidden rounded-xl">
              <HandSVG pose={gesture.pose} className="h-[92%] w-auto drop-shadow-lg" />
            </div>
            <p className="rounded-lg bg-deep px-3 py-2 text-center text-sm italic text-inkbody/90 ring-1 ring-cardline">
              “{gesture.voice}”
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] leading-relaxed text-inkbody">{gesture.blurb}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {ROWS.map((r) => (
                <div key={r.key} className="rounded-xl border border-cardline bg-card p-3.5">
                  <p className={`mb-1.5 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider ${r.tone}`}>
                    <r.icon size={13} /> {r.label}
                  </p>
                  <p className="text-[13px] leading-relaxed text-inkbody/90">{d[r.key]}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-cardline bg-card p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-pulse">
                <MessageCircleHeart size={13} /> Meaning & usage
              </p>
              <p className="text-[13px] leading-relaxed text-inkbody/90">{d.meaning}</p>
            </div>

            <div className="rounded-xl border border-pulse/30 bg-pulse/8 p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-pulse">
                <Brain size={13} /> How the AI detects it
              </p>
              <p className="text-[13px] leading-relaxed text-inkbody/90">{d.ml}</p>
            </div>

            <div className="rounded-xl border border-warn/30 bg-warn/8 p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-warn">
                <AlertTriangle size={13} /> Common learner mistake
              </p>
              <p className="text-[13px] leading-relaxed text-inkbody/90">{d.mistake}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
