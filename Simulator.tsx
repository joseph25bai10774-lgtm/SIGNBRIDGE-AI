import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Hand, Volume2, VolumeX, Play, Cpu, Radio } from "lucide-react";
import { GESTURES, gestureById, type Gesture } from "../data/gestures";
import { useRecognition, speak } from "../lib/recognition";
import HandSVG from "./HandSVG";

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-inkdim transition hover:text-inkbody"
    >
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-pulse" : "bg-cardline"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-abyss transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

export default function Simulator({ onRecognized }: { onRecognized: (id: string | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognized, setRecognized] = useState<{ g: Gesture; score: number } | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [demo, setDemo] = useState(false);
  const [history, setHistory] = useState<Gesture[]>([]);

  const handleCommit = (id: string, score: number) => {
    const g = gestureById(id);
    if (!g) return;
    setRecognized({ g, score });
    setHistory((h) => [g, ...h.filter((x) => x.id !== g.id)].slice(0, 6));
    onRecognized(id);
    if (voiceOn) speak(g.voice);
  };

  const { status, errorMsg, live, hands, start, stop, demoCommit } = useRecognition(videoRef, canvasRef, handleCommit);

  useEffect(() => () => { if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); }, []);

  const top = live.slice(0, 4);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* ------- camera stage ------- */}
      <div className="lg:col-span-3">
        <div className="relative overflow-hidden rounded-xl border border-cardline bg-black/60">
          <div className="relative aspect-video -scale-x-100">
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>

          {status === "running" && (
            <div className="pointer-events-none absolute inset-x-0 scanline h-10 bg-gradient-to-b from-transparent via-pulse/20 to-transparent" />
          )}

          {/* status chip */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider ${
              status === "running" ? "bg-good/15 text-good" : status === "loading" ? "bg-warn/15 text-warn" : status === "error" ? "bg-bad/15 text-bad" : "bg-cardline/40 text-inkdim"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status === "running" ? "bg-good blink-dot" : status === "loading" ? "bg-warn" : status === "error" ? "bg-bad" : "bg-inkdim"}`} />
              {status === "running" ? `Live · ${hands} hand${hands === 1 ? "" : "s"}` : status === "loading" ? "Loading model…" : status === "error" ? "Offline" : "Standby"}
            </span>
          </div>

          {/* idle / error overlays */}
          {status !== "running" && status !== "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-abyss/80 p-6 text-center backdrop-blur-sm">
              {status === "error" ? (
                <>
                  <CameraOff className="text-bad" size={34} />
                  <p className="max-w-sm text-sm text-inkbody/85">{errorMsg}</p>
                </>
              ) : (
                <>
                  <div className="floaty"><HandSVG pose={GESTURES[0].pose} className="h-24 w-auto" /></div>
                  <p className="max-w-sm text-sm text-inkbody/85">
                    Start the camera and sign in front of it. The engine tracks 21 landmarks per hand and classifies all 24 gestures in real time.
                  </p>
                </>
              )}
              <button
                onClick={start}
                className="flex items-center gap-2 rounded-lg bg-pulse px-5 py-2.5 font-display text-sm font-bold text-abyss transition hover:brightness-110 active:scale-95"
              >
                <Play size={16} /> {status === "error" ? "Retry camera" : "Start camera"}
              </button>
            </div>
          )}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-abyss/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-sm text-inkbody">
                <Cpu className="animate-spin text-pulse" size={20} /> Fetching hand-landmarker model…
              </div>
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-cardline bg-card px-4 py-3">
          {status === "running" ? (
            <button onClick={stop} className="flex items-center gap-2 rounded-md border border-bad/50 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-bad transition hover:bg-bad/10">
              <CameraOff size={14} /> Stop
            </button>
          ) : (
            <button onClick={start} className="flex items-center gap-2 rounded-md border border-cardline-bright px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-inkcard transition hover:bg-cardline/30">
              <Camera size={14} /> Start camera
            </button>
          )}
          <Switch on={voiceOn} onClick={() => setVoiceOn((v) => !v)} label={voiceOn ? "Voice on" : "Voice off"} />
          <Switch on={demo} onClick={() => setDemo((d) => !d)} label="Demo mode" />
          <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-inkdim sm:flex">
            <Radio size={12} className="text-pulse" /> MediaPipe HandLandmarker · 21 pts/hand
          </span>
        </div>

        {/* demo chips */}
        {demo && (
          <div className="mt-3 rounded-lg border border-dashed border-cardline bg-deep/50 p-3">
            <p className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim">
              Demo mode — tap a gesture to simulate recognition
            </p>
            <div className="flex flex-wrap gap-1.5">
              {GESTURES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => demoCommit(g.id)}
                  className="rounded-full border border-cardline px-2.5 py-1 text-[11px] text-inkbody/85 transition hover:border-pulse hover:text-pulse"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------- reply panel ------- */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className={`rounded-xl border p-4 transition-colors ${recognized ? "border-pulse/60 bg-card" : "border-cardline bg-card"}`}>
          <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim">AI reply</p>
          {recognized ? (
            <div className="mt-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-deep p-1.5 ring-1 ring-cardline">
                  <HandSVG pose={recognized.g.pose} className="h-14 w-auto" />
                </div>
                <div>
                  <h4 className="font-display text-xl font-extrabold uppercase text-inkcard">{recognized.g.name}</h4>
                  <p className="text-xs text-inkdim">{recognized.g.blurb}</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg rounded-tl-none bg-pulse/12 px-3 py-2.5 ring-1 ring-pulse/30">
                {voiceOn ? <Volume2 size={15} className="mt-0.5 shrink-0 text-pulse" /> : <VolumeX size={15} className="mt-0.5 shrink-0 text-inkdim" />}
                <p className="text-sm leading-snug text-inkbody">“{recognized.g.voice}”</p>
              </div>
              <p className="mt-2 text-right font-display text-[10px] font-bold uppercase tracking-wider text-good">
                confidence {(recognized.score * 100).toFixed(0)}%
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-inkbody/70">
              No gesture recognised yet. Sign clearly inside the frame — the reply appears here as text and is spoken aloud.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-cardline bg-card p-4">
          <p className="mb-2.5 font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim">Live candidate scores</p>
          {top.length ? (
            <div className="space-y-2">
              {top.map((c) => {
                const g = gestureById(c.id);
                return (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="w-28 truncate text-[11px] font-semibold uppercase tracking-wide text-inkbody/85">{g?.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-deep">
                      <div className="meter-fill h-full rounded-full bg-gradient-to-r from-cardline-bright to-pulse" style={{ width: `${Math.min(100, c.score * 100)}%` }} />
                    </div>
                    <span className="w-8 text-right font-display text-[10px] text-inkdim">{(c.score * 100).toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-inkdim">Waiting for hand landmarks…</p>
          )}
        </div>

        <div className="rounded-xl border border-cardline bg-card p-4">
          <p className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim">Session log</p>
          {history.length ? (
            <div className="flex flex-wrap gap-1.5">
              {history.map((g) => (
                <span key={g.id} className="flex items-center gap-1 rounded-full bg-deep px-2.5 py-1 text-[11px] text-inkbody/85 ring-1 ring-cardline">
                  <Hand size={11} className="text-pulse" /> {g.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-inkdim">Recognised gestures will stack up here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
