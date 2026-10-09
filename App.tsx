import { useEffect, useMemo, useState } from "react";
import {
  Hand, ScanLine, AudioLines, FileText, Network, BrainCircuit, Camera, GitBranch,
  ChevronDown, Sparkles, Accessibility, GraduationCap, SquareTerminal, Globe, MonitorDown,
} from "lucide-react";
import { GESTURES, CATEGORIES, type Gesture } from "./data/gestures";
import { speak } from "./lib/recognition";
import HandSVG from "./components/HandSVG";
import GestureCard from "./components/GestureCard";
import Simulator from "./components/Simulator";
import TestMode from "./components/TestMode";
import DeepDive from "./components/DeepDive";
import CodeLab from "./components/CodeLab";
import SetupGuide from "./components/SetupGuide";

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="reveal mb-8">
      <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-pulse">
        <span className="h-px w-8 bg-pulse" /> {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-3xl font-extrabold text-inkbody sm:text-4xl">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-inkdim">{sub}</p>}
    </div>
  );
}

const PIPELINE = [
  { icon: Camera, title: "1 · Capture", text: "The webcam stream is mirrored for natural self-view and sampled at ~30 fps into the vision task runner." },
  { icon: ScanLine, title: "2 · Landmark detection", text: "MediaPipe HandLandmarker localises 21 3D keypoints per hand (up to two hands) — wrist, knuckles, joints and fingertips." },
  { icon: GitBranch, title: "3 · Feature extraction", text: "Each frame is reduced to a pose signature (which fingers extend, spread, pinch, cone) plus a 1.2 s motion history of the wrist." },
  { icon: BrainCircuit, title: "4 · Gesture classifier", text: "Motion signatures — waves, nods, circles, rising/falling paths — are fused with the pose to score all 24 gesture rules." },
  { icon: AudioLines, title: "5 · Voice reply", text: "A committed gesture is spoken aloud through the Web Speech API with a tuned English voice, rate and pitch." },
  { icon: FileText, title: "6 · Text reply", text: "The same reply renders as text with a confidence score, so the message is received through two channels at once." },
];

export default function App() {
  const [recognizedId, setRecognizedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Gesture | null>(null);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const shown = useMemo(
    () => (filter === "All" ? GESTURES : GESTURES.filter((g) => g.category === filter)),
    [filter],
  );

  return (
    <div className="ambient min-h-screen">
      <div className="dotgrid min-h-screen">
        {/* ============ NAV ============ */}
        <nav className="sticky top-0 z-40 border-b border-cardline/60 bg-abyss/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-pulse/15 ring-1 ring-pulse/40">
                <Hand className="text-pulse" size={18} />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-inkbody">
                SignBridge <span className="text-pulse">AI</span>
              </span>
            </a>
            <div className="hidden items-center gap-5 font-display text-[13px] font-semibold text-inkdim lg:flex xl:gap-6">
              <a href="#simulator" className="transition hover:text-pulse">Simulator</a>
              <a href="#chart" className="transition hover:text-pulse">Gesture Chart</a>
              <a href="#concepts" className="transition hover:text-pulse">Deep Concepts</a>
              <a href="#test" className="transition hover:text-pulse">Test Yourself</a>
              <a href="#pipeline" className="transition hover:text-pulse">Pipeline</a>
              <a href="#python" className="flex items-center gap-1.5 rounded-md border border-pulse/50 px-2.5 py-1 text-pulse transition hover:bg-pulse/10">
                <SquareTerminal size={13} /> Python Code
              </a>
              <a href="#setup" className="transition hover:text-pulse">Setup Guide</a>
            </div>
            <span className="rounded-full border border-cardline px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-inkcard">
              24 gestures
            </span>
          </div>
        </nav>

        {/* ============ HERO ============ */}
        <header id="top" className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="reveal is-in">
              <p className="inline-flex items-center gap-2 rounded-full border border-cardline bg-card px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-inkcard">
                <GraduationCap size={13} className="text-pulse" /> B.Tech CSE · AIML · Credit 4 Project
              </p>
              <h1 className="mt-5 font-display text-[44px] font-extrabold leading-[1.04] tracking-tight text-inkbody sm:text-6xl">
                A hand language<br />
                <span className="text-inktitle">simulator</span> that listens<br />
                with its eyes.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-inkdim">
                TRANSLATOR AI watches your hands, recognises <strong className="text-inkbody">24 sign-language gestures</strong> and
                their movement, then answers with <strong className="text-inkbody">voice and text</strong> — making everyday
                communication easier for deaf, hard-of-hearing and differently-abled people, and for everyone around them.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#simulator" className="flex items-center gap-2 rounded-lg bg-pulse px-6 py-3 font-display text-sm font-bold text-abyss transition hover:brightness-110 active:scale-95">
                  <ScanLine size={16} /> Launch live simulator
                </a>
                <a href="#chart" className="flex items-center gap-2 rounded-lg border border-cardline-bright px-6 py-3 font-display text-sm font-bold text-inkcard transition hover:bg-cardline/25 active:scale-95">
                  Browse the 24 gestures
                </a>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-4 gap-4">
                {[
                  ["24", "gestures analysed"],
                  ["21", "landmarks / hand"],
                  ["4", "views per sign"],
                  ["2", "reply channels"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-3xl font-extrabold text-pulse">{n}</dt>
                    <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-inkdim">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* scanner visual */}
            <div className="reveal is-in relative mx-auto w-full max-w-md">
              <div className="relative rounded-2xl border border-cardline-bright bg-panel p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-pulse" />
                <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-pulse" />
                <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-pulse" />
                <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-pulse" />
                <div className="tile-studio relative aspect-[4/5] overflow-hidden rounded-xl">
                  <div className="scanline absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-pulse/25 to-transparent" />
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <div className="wave-hand">
                      <HandSVG pose={GESTURES[0].pose} className="h-64 w-auto drop-shadow-[0_14px_18px_rgba(0,0,0,0.4)]" />
                    </div>
                  </div>
                  {/* faux landmark dots */}
                  {[[38, 22], [46, 12], [55, 9], [63, 13], [70, 24], [52, 44], [44, 60]].map(([x, y], i) => (
                    <span key={i} className="absolute h-2 w-2 rounded-full bg-pulse shadow-[0_0_10px_2px_rgba(76,195,255,0.7)]" style={{ left: `${x}%`, top: `${y}%` }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-good">
                    <span className="h-1.5 w-1.5 rounded-full bg-good blink-dot" /> Recognised: Hello
                  </span>
                  <span className="font-display text-[11px] text-inkdim">conf 96%</span>
                </div>
              </div>
              <div className="floaty absolute -left-6 top-8 hidden rounded-lg border border-cardline bg-card px-3 py-2 text-xs font-semibold text-inkbody shadow-xl sm:block">
                <AudioLines size={13} className="mr-1 inline text-pulse" /> Voice reply
              </div>
              <div className="floaty absolute -right-4 bottom-16 hidden rounded-lg border border-cardline bg-card px-3 py-2 text-xs font-semibold text-inkbody shadow-xl sm:block" style={{ animationDelay: "1.2s" }}>
                <FileText size={13} className="mr-1 inline text-good" /> Text reply
              </div>
            </div>
          </div>
        </header>

        {/* ============ SIMULATOR ============ */}
        <section id="simulator" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
          <SectionHead
            eyebrow="Live simulator"
            title="Sign at your camera. Hear the reply."
            sub="The recognition engine runs entirely in your browser. Allow camera access, perform any of the 24 gestures, and SignBridge answers with speech and text. No camera handy? Flip on Demo mode."
          />
          <Simulator onRecognized={setRecognizedId} />
        </section>

        {/* ============ CHART (reference recreation) ============ */}
        <section id="chart" className="scroll-mt-20 border-y border-cardline/50 bg-deep/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal mb-8 text-center">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-inktitle sm:text-5xl">
                Sign Language Hand Gestures
              </h2>
              <p className="mt-3 flex items-center justify-center gap-3 text-lg text-inkbody/90">
                Learn <span className="text-pulse">•</span> Communicate <span className="text-pulse">•</span> Include
              </p>
            </div>

            <div className="reveal mb-8 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition ${filter === c ? "bg-pulse text-abyss" : "border border-cardline text-inkdim hover:border-cardline-bright hover:text-inkcard"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {shown.map((g) => (
                <GestureCard
                  key={g.id}
                  gesture={g}
                  active={recognizedId === g.id}
                  onSelect={setSelected}
                  onSpeak={(x) => speak(x.voice)}
                />
              ))}
            </div>
            <p className="reveal mt-6 text-center text-xs text-inkdim">
              Tip: cards light up when the live simulator recognises their gesture. Click “Deep explanation” for the full phonology.
            </p>
          </div>
        </section>

        {/* ============ DEEP CONCEPTS ============ */}
        <section id="concepts" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="Deep concepts"
            title="The phonology inside every sign"
            sub="Every sign language builds meaning from four parameters — handshape, movement, location and orientation. Changing any one of them can change the word entirely. Expand each of the 24 gestures to see the analysis, the AI detection cue and the classic learner mistake."
          />
          <div className="grid gap-2.5">
            {GESTURES.map((g, i) => (
              <details key={g.id} className="deepline reveal group rounded-xl border border-cardline bg-card transition hover:border-cardline-bright">
                <summary className="flex items-center gap-4 px-5 py-4">
                  <span className="font-display text-sm font-bold text-inkdim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hidden h-12 w-10 shrink-0 sm:block">
                    <HandSVG pose={g.pose} className="h-full w-full" />
                  </span>
                  <span className="flex-1">
                    <span className="font-display text-base font-bold uppercase tracking-wide text-inkcard">{g.name}</span>
                    <span className="ml-3 hidden text-sm text-inkdim md:inline">{g.blurb}</span>
                  </span>
                  <span className="hidden rounded-full border border-cardline px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-inkdim sm:inline">{g.category}</span>
                  <ChevronDown size={16} className="chev text-inkdim" />
                </summary>
                <div className="grid gap-3 border-t border-cardline px-5 py-4 md:grid-cols-2">
                  <p className="text-sm leading-relaxed text-inkbody/90"><strong className="text-pulse">Handshape · </strong>{g.deep.handshape}</p>
                  <p className="text-sm leading-relaxed text-inkbody/90"><strong className="text-good">Movement · </strong>{g.deep.movement}</p>
                  <p className="text-sm leading-relaxed text-inkbody/90"><strong className="text-warn">Location · </strong>{g.deep.location}</p>
                  <p className="text-sm leading-relaxed text-inkbody/90"><strong className="text-inkcard">Orientation · </strong>{g.deep.orientation}</p>
                  <p className="text-sm leading-relaxed text-inkbody/90 md:col-span-2"><strong className="text-inktitle">Meaning · </strong>{g.deep.meaning}</p>
                  <p className="rounded-lg bg-pulse/8 px-3 py-2 text-sm leading-relaxed text-inkbody/90 ring-1 ring-pulse/25 md:col-span-2">
                    <BrainCircuit size={13} className="mr-1 inline text-pulse" /> <strong>AI cue · </strong>{g.deep.ml}
                  </p>
                  <p className="text-sm leading-relaxed text-warn/90 md:col-span-2"><strong>Common mistake · </strong>{g.deep.mistake}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ============ TEST ============ */}
        <section id="test" className="scroll-mt-20 border-y border-cardline/50 bg-deep/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="Test yourself"
              title="Prove you can sign it"
              sub="The simulator shows a target gesture — perform it in front of the camera and the engine grades you. Build a streak, or use “Simulate pass” to exercise the scoring pipeline without a webcam."
            />
            <TestMode />
          </div>
        </section>

        {/* ============ PIPELINE ============ */}
        <section id="pipeline" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="System architecture"
            title="How a hand becomes a sentence"
            sub="A six-stage browser-native pipeline. No frames ever leave the device — recognition, dialogue and speech all run locally, which matters for privacy and for deployment on low-cost hardware in schools and clinics."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PIPELINE.map((p, i) => (
              <div key={p.title} className="reveal card-hover relative rounded-xl border border-cardline bg-card p-5">
                <span className="absolute right-4 top-4 font-display text-4xl font-extrabold text-cardline/60">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-pulse/12 ring-1 ring-pulse/35">
                  <p.icon size={20} className="text-pulse" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-inkcard">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-inkbody/85">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-cardline bg-card p-5">
              <Network size={20} className="text-pulse" />
              <h3 className="mt-3 font-display text-base font-bold text-inkcard">Why heuristics + landmarks</h3>
              <p className="mt-2 text-sm leading-relaxed text-inkbody/85">
                Finger-extension booleans plus wrist motion signatures (wave, nod, circle, rise, fall) give an interpretable,
                real-time classifier for 24 classes with zero training data — ideal for an embedded demo.
              </p>
            </div>
            <div className="rounded-xl border border-cardline bg-card p-5">
              <Sparkles size={20} className="text-warn" />
              <h3 className="mt-3 font-display text-base font-bold text-inkcard">Upgrade path</h3>
              <p className="mt-2 text-sm leading-relaxed text-inkbody/85">
                The same 21-point landmark stream can feed an LSTM or transformer over time-series for higher accuracy,
                continuous fingerspelling, and two-hand symmetry constraints.
              </p>
            </div>
            <div className="rounded-xl border border-cardline bg-card p-5">
              <Accessibility size={20} className="text-good" />
              <h3 className="mt-3 font-display text-base font-bold text-inkcard">Built for society</h3>
              <p className="mt-2 text-sm leading-relaxed text-inkbody/85">
                Dual voice + text output, high-contrast accessible type (Atkinson Hyperlegible), and camera-local processing —
                a modification of regular communication tools, with more accuracy and dignity for every user.
              </p>
            </div>
          </div>
        </section>

        {/* ============ PYTHON BUILD ============ */}
        <section id="python" className="scroll-mt-20 border-y border-cardline/50 bg-deep/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="Option A · Python desktop build"
              title="The same simulator in pure Python"
              sub="Prefer a standalone desktop app? Option A is the entire project consolidated into one self-contained Python file — OpenCV for the camera, MediaPipe for the 21 hand landmarks, the identical pose + motion classifier, and pyttsx3 for the spoken reply. Copy one file, install three packages, run."
            />

            <div className="reveal mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-pulse/50 bg-card p-5 ring-1 ring-pulse/20">
                <div className="flex items-center gap-2">
                  <MonitorDown size={18} className="text-pulse" />
                  <h3 className="font-display text-base font-bold text-inkcard">Option A — this Python build</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-inkbody/85">
                  One file, six numbered sections: <code className="rounded bg-deep px-1.5 py-0.5 font-mono text-[12px] text-pulse">signbridge_ai.py</code> opens
                  your webcam with OpenCV, draws the live skeleton, commits a gesture after 0.75 s of stability and answers
                  with pyttsx3 voice + on-screen text. Add <code className="rounded bg-deep px-1.5 py-0.5 font-mono text-[12px] text-pulse">--test</code> for the scored quiz.
                </p>
              </div>
              <div className="rounded-xl border border-cardline bg-card p-5">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-inkdim" />
                  <h3 className="font-display text-base font-bold text-inkbody/80">Option B — the web app above</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-inkbody/70">
                  The exact same recognition logic ported to the browser with MediaPipe Tasks + the Web Speech API — no install,
                  works on phones, and everything stays on-device. Both options share the 24-gesture rule table.
                </p>
              </div>
            </div>

            <div className="reveal"><CodeLab /></div>
          </div>
        </section>

        {/* ============ SETUP GUIDE ============ */}
        <section id="setup" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="Setup guide · zero to running"
            title="Build & run it in VS Code"
            sub="Never touched Python before? Follow these eight steps exactly. Every command has a copy button — the guide assumes a brand-new machine and ends with the simulator recognising your hands on screen."
          />
          <SetupGuide />
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-cardline/60 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-inkbody">
              <Hand size={15} className="text-pulse" /> TRANSLATOR AI
            </p>

            <p className="text-xs text-inkdim">
              Hand Language Simulator · B.Tech CSE (AIML) · Credit 4 · 24 gestures analysed across 4 views each
            </p>
            <p className="text-xs text-inkdim">Learn • Communicate • Include</p>
          </div>
        </footer>
      </div>

      <DeepDive gesture={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
