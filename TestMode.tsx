import { useRef, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, SkipForward, Play, Trophy, Flame } from "lucide-react";
import { GESTURES, gestureById, type Gesture } from "../data/gestures";
import { useRecognition } from "../lib/recognition";
import HandSVG from "./HandSVG";

const pick = (avoid?: string) => {
  let g = GESTURES[Math.floor(Math.random() * GESTURES.length)];
  while (g.id === avoid) g = GESTURES[Math.floor(Math.random() * GESTURES.length)];
  return g;
};

export default function TestMode() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<Gesture>(() => pick());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [wrongName, setWrongName] = useState("");
  const lockRef = useRef(false);

  const handleCommit = (id: string) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const ok = id === target.id;
    setFlash(ok ? "good" : "bad");
    if (!ok) setWrongName(gestureById(id)?.name ?? "unknown");
    if (ok) { setScore((s) => s + 1); setStreak((s) => s + 1); }
    else setStreak(0);
    setRound((r) => r + 1);
    setTimeout(() => {
      setFlash(null);
      if (ok) setTarget((t) => pick(t.id));
      lockRef.current = false;
    }, 1500);
  };

  const { status, start, stop, demoCommit } = useRecognition(videoRef, canvasRef, handleCommit);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-cardline bg-card p-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-inkdim">Round {round + 1} — sign this</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="tile-studio flex h-32 w-24 items-end justify-center overflow-hidden rounded-lg">
              <HandSVG pose={target.pose} className="h-[90%] w-auto" />
            </div>
            <div>
              <h4 className="font-display text-2xl font-extrabold uppercase text-inkcard">{target.name}</h4>
              <p className="mt-1 text-sm text-inkbody/85">{target.blurb}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => { if (!lockRef.current) setTarget((t) => pick(t.id)); }}
              className="flex items-center gap-1.5 rounded-md border border-cardline px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-inkdim transition hover:border-cardline-bright hover:text-inkcard"
            >
              <SkipForward size={13} /> Skip
            </button>
            <button
              onClick={() => demoCommit(target.id)}
              className="flex items-center gap-1.5 rounded-md border border-cardline px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-inkdim transition hover:border-pulse hover:text-pulse"
            >
              <Play size={13} /> Simulate pass
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, label: "Score", value: score, tone: "text-pulse" },
            { icon: Flame, label: "Streak", value: streak, tone: "text-warn" },
            { icon: RotateCcw, label: "Rounds", value: round, tone: "text-inkcard" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-cardline bg-card p-3 text-center">
              <s.icon size={16} className={`mx-auto ${s.tone}`} />
              <p className="mt-1 font-display text-2xl font-extrabold text-inkbody">{s.value}</p>
              <p className="font-display text-[10px] font-semibold uppercase tracking-wider text-inkdim">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className={`relative overflow-hidden rounded-xl border bg-black/60 transition-colors ${
          flash === "good" ? "border-good" : flash === "bad" ? "border-bad" : "border-cardline"
        }`}>
          <div className="relative aspect-video -scale-x-100">
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>
          {flash && (
            <div className={`toast-in absolute inset-0 flex items-center justify-center ${flash === "good" ? "bg-good/15" : "bg-bad/15"}`}>
              <div className={`flex items-center gap-3 rounded-xl px-6 py-4 font-display text-xl font-extrabold ${flash === "good" ? "bg-good text-abyss" : "bg-bad text-abyss"}`}>
                {flash === "good" ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
                {flash === "good" ? "Correct!" : `Read as “${wrongName}” — try again`}
              </div>
            </div>
          )}
          {status !== "running" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-abyss/80 p-6 text-center backdrop-blur-sm">
              <p className="max-w-xs text-sm text-inkbody/85">Perform the target gesture in front of your camera to score. No camera? Use “Simulate pass”.</p>
              <button onClick={start} className="flex items-center gap-2 rounded-lg bg-pulse px-5 py-2.5 font-display text-sm font-bold text-abyss transition hover:brightness-110 active:scale-95">
                <Play size={15} /> Start test camera
              </button>
            </div>
          )}
        </div>
        {status === "running" && (
          <button onClick={stop} className="mt-3 rounded-md border border-bad/50 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-bad transition hover:bg-bad/10">
            Stop test camera
          </button>
        )}
      </div>
    </div>
  );
}
