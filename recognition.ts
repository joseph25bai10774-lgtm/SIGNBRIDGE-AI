import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export type LM = { x: number; y: number; z: number };

/* ================= feature extraction ================= */

const D = (a: LM | { x: number; y: number }, b: LM | { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export interface PoseFeatures {
  index: boolean; middle: boolean; ring: boolean; pinky: boolean; thumb: boolean;
  spread: boolean; pinch: boolean; cone: boolean; fist: boolean; open: boolean; cShape: boolean;
  scale: number;
}

export function poseOf(lm: LM[]): PoseFeatures {
  const s = D(lm[0], lm[9]) || 1e-6;
  const ext = (pip: number, tip: number) => D(lm[tip], lm[0]) > D(lm[pip], lm[0]) * 1.12;
  const index = ext(6, 8), middle = ext(10, 12), ring = ext(14, 16), pinky = ext(18, 20);
  const thumb = D(lm[4], lm[17]) > D(lm[3], lm[17]) * 1.08;
  const spread = D(lm[8], lm[12]) / s > 0.6;
  const pinch = D(lm[4], lm[8]) / s < 0.32;
  const cone = !index && [8, 12, 16, 20].every((t) => D(lm[t], lm[4]) / s < 0.45);
  const fist = !index && !middle && !ring && !pinky;
  const open = index && middle && ring && pinky;
  const cShape = thumb && index && ring && pinky && !pinch && D(lm[4], lm[8]) / s < 0.8;
  return { index, middle, ring, pinky, thumb, spread, pinch, cone, fist, open, cShape, scale: s };
}

interface HistFrame { x: number; y: number; s: number; t: number }

export interface MotionFeatures {
  xRev: number; yRev: number; circ: number;
  netDX: number; netDY: number; pathLen: number;
  scaleChange: number; minY: number; startY: number; travel: number;
}

export function motionOf(hist: HistFrame[]): MotionFeatures {
  const zero: MotionFeatures = { xRev: 0, yRev: 0, circ: 0, netDX: 0, netDY: 0, pathLen: 0, scaleChange: 0, minY: 1, startY: 1, travel: 0 };
  if (hist.length < 4) return zero;
  let xRev = 0, yRev = 0, pathLen = 0, cross = 0, prevDX = 0, prevDY = 0;
  let minY = 1;
  for (let i = 1; i < hist.length; i++) {
    const dx = hist[i].x - hist[i - 1].x;
    const dy = hist[i].y - hist[i - 1].y;
    pathLen += Math.hypot(dx, dy);
    if (Math.abs(dx) > 0.004 && prevDX !== 0 && Math.sign(dx) !== Math.sign(prevDX)) xRev++;
    if (Math.abs(dy) > 0.004 && prevDY !== 0 && Math.sign(dy) !== Math.sign(prevDY)) yRev++;
    if (i > 1) cross += prevDX * dy - prevDY * dx;
    if (Math.abs(dx) > 0.002) prevDX = dx;
    if (Math.abs(dy) > 0.002) prevDY = dy;
    minY = Math.min(minY, hist[i].y);
  }
  const first = hist[0], last = hist[hist.length - 1];
  const netDX = last.x - first.x, netDY = last.y - first.y;
  return {
    xRev, yRev,
    circ: pathLen > 0.02 ? Math.max(-1, Math.min(1, (cross / (pathLen * pathLen)) * 6)) : 0,
    netDX, netDY, pathLen,
    scaleChange: (last.s - first.s) / first.s,
    minY, startY: first.y,
    travel: Math.abs(netDX) + Math.abs(netDY),
  };
}

/* ================= 24-gesture heuristic classifier ================= */

export interface Candidate { id: string; score: number }

export function classify(poses: PoseFeatures[], motion: MotionFeatures): Candidate[] {
  if (poses.length === 0) return [];
  const P = poses[0];
  const two = poses.length >= 2;
  const P2 = two ? poses[1] : null;
  const M = motion;

  const waveX = M.xRev >= 2 ? Math.min(1, M.xRev / 3) : 0;
  const nodY = M.yRev >= 2 ? Math.min(1, M.yRev / 3) : 0;
  const circle = Math.abs(M.circ) > 0.3 ? Math.min(1, Math.abs(M.circ) / 0.55) : 0;
  const still = M.pathLen < 0.09;
  const outTravel = M.travel;
  const chestZone = M.minY > 0.48;
  const faceZone = M.minY < 0.45;

  const onlyIndex = P.index && !P.middle && !P.ring && !P.pinky;
  const scores: Candidate[] = [];
  const push = (id: string, score: number) => { if (score > 0) scores.push({ id, score }); };

  // --- dynamic one-hand gestures ---
  if (P.open && !P.spread && waveX && !faceZone) push("hello", 0.45 + waveX * 0.5);
  if (P.open && P.spread && waveX) push("goodbye", 0.45 + waveX * 0.5);
  if (P.open && circle && chestZone && outTravel < 0.3) push("please", 0.4 + circle * 0.5);
  if (P.fist && circle && chestZone) push("sorry", 0.4 + circle * 0.5);
  if (P.open && M.startY < 0.42 && outTravel > 0.18) push("thank-you", 0.5 + Math.min(0.4, outTravel));
  if (P.open && !P.spread && M.scaleChange > 0.07 && chestZone && !waveX && circle < 0.3) push("excuse-me", 0.5 + M.scaleChange);
  if (P.fist && P.thumb && nodY) push("yes", 0.5 + nodY * 0.4);
  if (onlyIndex && waveX) push("no", 0.5 + waveX * 0.4);
  if (P.open && !two && M.netDY < -0.06 && outTravel > 0.08 && outTravel < 0.3 && !waveX) push("youre-welcome", 0.5);
  if (P.open && P.spread && faceZone && waveX) push("no-alt", 0.5 + waveX * 0.3);
  if (P.pinch && P.middle && P.ring && P.pinky && nodY) push("yes-alt", 0.5 + nodY * 0.3);
  if (P.cone && faceZone && !two) push("eat", 0.65);
  if (P.cShape && faceZone && !two) push("drink", 0.65);
  if (P.open && !faceZone && M.startY > 0.45 && M.startY < 0.9 && outTravel > 0.15 && !waveX && circle < 0.3) push("thanks", 0.52);

  // --- static one-hand poses ---
  if (still) {
    if (P.index && !P.middle && !P.ring && P.pinky && P.thumb) push("i-love-you", 0.82);
    if (P.pinch && P.middle && P.ring && P.pinky) push("okay", 0.78);
    if (P.fist && !P.thumb) push("fingerspell-a", 0.72);
    if (P.index && P.middle && !P.ring && !P.pinky) push("fingerspell-b", 0.78);
  }

  // --- two-hand gestures ---
  if (two && P2) {
    if (P.cone && P2.cone) push("more", 0.8);
    if ((P.open || P2.open) && M.netDY < -0.09) push("help", 0.6);
    if (P.open && P2.open && M.netDY > 0.05 && M.travel < 0.35) push("sorry-regret", 0.6);
    if (P.open && P2.open && M.netDY > 0.09) push("sleep", 0.62);
    if (onlyIndex !== (P2.index && !P2.middle && !P2.ring && !P2.pinky) && (onlyIndex || (P2.index && !P2.middle && !P2.ring && !P2.pinky))) {
      const other = onlyIndex ? P2 : P;
      if (other.open || other.fist) push(onlyIndex && other.fist ? "time" : "sign", 0.62);
    }
  }

  return scores.sort((a, b) => b.score - a.score).slice(0, 6);
}

/* ================= speech synthesis ================= */

let voiceCache: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (typeof speechSynthesis === "undefined") return;
  voiceCache = speechSynthesis.getVoices();
}
if (typeof speechSynthesis !== "undefined") {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

export function speak(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const en = voiceCache.find((v) => v.lang.startsWith("en") && /female|zira|samantha|google/i.test(v.name)) ||
    voiceCache.find((v) => v.lang.startsWith("en"));
  if (en) u.voice = en;
  u.rate = 0.98; u.pitch = 1.02;
  speechSynthesis.speak(u);
}

/* ================= React hook ================= */

export type EngineStatus = "idle" | "loading" | "running" | "error" | "demo";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useRecognition(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onCommit: (id: string, score: number) => void,
) {
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [live, setLive] = useState<Candidate[]>([]);
  const [hands, setHands] = useState(0);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef(0);
  const histRef = useRef<HistFrame[]>([]);
  const stableRef = useRef<{ id: string; since: number } | null>(null);
  const lastCommitRef = useRef<{ id: string; at: number } | null>(null);
  const runningRef = useRef(false);

  const draw = useCallback((results: { landmarks: LM[][] }) => {
    const canvas = canvasRef.current, video = videoRef.current;
    if (!canvas || !video) return;
    if (canvas.width !== video.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    for (const lm of results.landmarks) {
      ctx.strokeStyle = "rgba(76,195,255,0.85)";
      ctx.lineWidth = 2;
      for (const c of HandLandmarker.HAND_CONNECTIONS) {
        const a = c.start, b = c.end;
        ctx.beginPath();
        ctx.moveTo(lm[a].x * W, lm[a].y * H);
        ctx.lineTo(lm[b].x * W, lm[b].y * H);
        ctx.stroke();
      }
      for (const p of lm) {
        ctx.fillStyle = "#eaf7ff";
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [canvasRef, videoRef]);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    const video = videoRef.current, lm = landmarkerRef.current;
    if (video && lm && video.readyState >= 2) {
      const res = lm.detectForVideo(video, performance.now());
      draw(res as { landmarks: LM[][] });
      const lms = (res.landmarks as LM[][]) || [];
      setHands(lms.length);
      if (lms.length > 0) {
        const poses = lms.map(poseOf);
        const h = histRef.current;
        h.push({ x: lms[0][0].x, y: lms[0][0].y, s: poses[0].scale, t: performance.now() });
        const cutoff = performance.now() - 1200;
        while (h.length > 2 && h[0].t < cutoff) h.shift();
        const cands = classify(poses, motionOf(h));
        setLive(cands);
        const top = cands[0];
        const now = performance.now();
        if (top && top.score >= 0.55) {
          if (stableRef.current?.id === top.id) {
            if (now - stableRef.current.since > 750) {
              if (lastCommitRef.current?.id !== top.id || now - lastCommitRef.current.at > 2500) {
                lastCommitRef.current = { id: top.id, at: now };
                onCommit(top.id, top.score);
              }
              stableRef.current = null;
            }
          } else {
            stableRef.current = { id: top.id, since: now };
          }
        } else {
          stableRef.current = null;
        }
      } else {
        histRef.current = [];
        setLive([]);
        stableRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, onCommit, videoRef]);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    if (v?.srcObject) (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    histRef.current = [];
    setLive([]);
    setHands(0);
    setStatus("idle");
  }, [videoRef]);

  const start = useCallback(async () => {
    setErrorMsg("");
    setStatus("loading");
    try {
      if (!landmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 2,
        });
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
      const video = videoRef.current;
      if (!video) throw new Error("Video element unavailable");
      video.srcObject = stream;
      await new Promise<void>((r) => { video.onloadedmetadata = () => r(); });
      await video.play();
      runningRef.current = true;
      setStatus("running");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      const err = e as Error;
      setStatus("error");
      setErrorMsg(err?.name === "NotAllowedError" ? "Camera permission was denied. Use Demo Mode below to test the voice + text pipeline." : `Could not start the camera or model: ${err?.message ?? e}`);
    }
  }, [loop, videoRef]);

  const demoCommit = useCallback((id: string) => {
    lastCommitRef.current = { id, at: performance.now() };
    onCommit(id, 1);
  }, [onCommit]);

  useEffect(() => () => { runningRef.current = false; cancelAnimationFrame(rafRef.current); }, []);

  return { status, errorMsg, live, hands, start, stop, demoCommit };
}
