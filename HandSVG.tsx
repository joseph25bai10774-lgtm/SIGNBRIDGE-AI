import type { PoseConfig } from "../data/gestures";

/* ---------- tiny vector helpers ---------- */
type V = { x: number; y: number };
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const lerp = (a: V, b: V, t: number): V => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const rot = (v: V, deg: number): V => {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
};

interface FingerSpec {
  base: V;
  len: number;
  width: number;
  spread: number;
}

const FINGERS: FingerSpec[] = [
  { base: { x: 47, y: 79 }, len: 40, width: 9.5, spread: -7 },
  { base: { x: 58, y: 76 }, len: 44, width: 10, spread: -1 },
  { base: { x: 69, y: 79 }, len: 40, width: 9.5, spread: 6 },
  { base: { x: 78.5, y: 85 }, len: 31, width: 8, spread: 14 },
];

const SKIN = "#cf9463";
const SKIN_SHADE = "#b07a4b";
const SLEEVE = "#16283c";

function fingerPath(spec: FingerSpec, extended: boolean, spreadOn: boolean): { d: string; w: number } {
  const spreadDeg = spreadOn ? spec.spread * 1.6 : spec.spread * 0.45;
  const up = rot({ x: 0, y: -1 }, spreadDeg);
  const extTip = add(spec.base, { x: up.x * spec.len, y: up.y * spec.len });
  const curl = extended ? 0 : 1;
  const curlTip: V = { x: spec.base.x + (59 - spec.base.x) * 0.3, y: spec.base.y + spec.len * 0.46 };
  const tip = lerp(extTip, curlTip, curl);
  const mid: V = { x: spec.base.x + up.x * spec.len * 0.5, y: spec.base.y + up.y * spec.len * 0.5 };
  const outDir = spec.base.x <= 59 ? -1 : 1;
  const bulge: V = { x: mid.x + outDir * 7, y: mid.y + 4 };
  const ctrl = lerp(mid, bulge, curl);
  return { d: `M ${spec.base.x} ${spec.base.y} Q ${ctrl.x} ${ctrl.y} ${tip.x} ${tip.y}`, w: spec.width };
}

function thumbPath(kind: PoseConfig["thumb"]): { d: string; w: number } {
  const base: V = { x: 41, y: 103 };
  const targets: Record<PoseConfig["thumb"], { tip: V; ctrl: V }> = {
    up: { tip: { x: 29, y: 57 }, ctrl: { x: 29, y: 82 } },
    side: { tip: { x: 35, y: 78 }, ctrl: { x: 31, y: 92 } },
    across: { tip: { x: 66, y: 97 }, ctrl: { x: 50, y: 102 } },
    out: { tip: { x: 22, y: 80 }, ctrl: { x: 27, y: 94 } },
    tip: { tip: { x: 48, y: 90 }, ctrl: { x: 34, y: 99 } },
  };
  const t = targets[kind];
  return { d: `M ${base.x} ${base.y} Q ${t.ctrl.x} ${t.ctrl.y} ${t.tip.x} ${t.tip.y}`, w: 11 };
}

function coneHand(): string[] {
  // all fingertips converge to an apex above the palm (Flat-O / MORE / EAT)
  const apex: V = { x: 58, y: 66 };
  const bases: V[] = [
    { x: 46, y: 80 },
    { x: 56, y: 78 },
    { x: 66, y: 80 },
    { x: 76, y: 86 },
    { x: 41, y: 102 },
  ];
  return bases.map((b, i) => {
    const out = i >= 4 ? -8 : i < 2 ? -5 : 6;
    return `M ${b.x} ${b.y} Q ${(b.x + apex.x) / 2 + out} ${(b.y + apex.y) / 2} ${apex.x} ${apex.y}`;
  });
}

function cHand(): string[] {
  // C-cup handshape for DRINK
  return [
    "M 46 80 Q 34 66 44 56",
    "M 57 77 Q 50 60 60 52",
    "M 68 80 Q 66 62 74 56",
    "M 78 86 Q 80 70 86 66",
    "M 41 102 Q 26 92 30 76",
  ];
}

function HandBody({ pose }: { pose: PoseConfig }) {
  const widths = [9.5, 10, 9.5, 8];
  return (
    <g>
      {/* sleeve */}
      <path d="M 40 128 Q 40 118 48 117 L 72 117 Q 80 118 80 128 L 82 152 L 38 152 Z" fill={SLEEVE} />
      <path d="M 40 124 L 80 124" stroke="#0d1c2c" strokeWidth="2" />
      {/* palm */}
      <path
        d="M 39 88 Q 39 74 50 73 L 72 73 Q 81 74 81 88 L 80 112 Q 79 122 60 122 Q 41 122 40 112 Z"
        fill={SKIN}
      />
      <path d="M 44 96 Q 58 102 76 95" stroke={SKIN_SHADE} strokeWidth="1.6" fill="none" opacity="0.55" />
      {/* fingers */}
      {pose.shape === "cone" ? (
        coneHand().map((d, i) => (
          <path key={i} d={d} stroke={SKIN} strokeWidth={widths[Math.min(i, 3)]} strokeLinecap="round" fill="none" />
        ))
      ) : pose.shape === "c" ? (
        cHand().map((d, i) => (
          <path key={i} d={d} stroke={SKIN} strokeWidth={widths[Math.min(i, 3)]} strokeLinecap="round" fill="none" />
        ))
      ) : (
        <>
          {FINGERS.map((spec, i) => {
            const { d, w } = fingerPath(spec, pose.fingers[i], !!pose.spread);
            return <path key={i} d={d} stroke={SKIN} strokeWidth={w} strokeLinecap="round" fill="none" />;
          })}
          {(() => {
            const { d, w } = thumbPath(pose.thumb);
            return <path d={d} stroke={SKIN} strokeWidth={w} strokeLinecap="round" fill="none" />;
          })()}
        </>
      )}
      {/* knuckle shading on palm top */}
      <path d="M 42 78 Q 60 72 79 78" stroke={SKIN_SHADE} strokeWidth="1.4" fill="none" opacity="0.5" />
    </g>
  );
}

export default function HandSVG({ pose, className }: { pose: PoseConfig; className?: string }) {
  return (
    <svg viewBox="0 0 120 152" className={className} aria-hidden="true">
      {pose.both && (
        <g transform="translate(128 6) scale(-0.82 0.82)" opacity="0.8">
          <HandBody pose={pose} />
        </g>
      )}
      <g transform={pose.both ? "translate(-6 0) scale(0.92)" : undefined}>
        <HandBody pose={pose} />
      </g>
    </svg>
  );
}
