import { useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import { Copy, Check, FileCode2, Terminal, Layers } from "lucide-react";
import { PY_SOURCE, PY_FILENAME, PY_LINES, PY_INSTALL_CMD, PY_RUN_CMDS } from "../data/pythonProject";

const SECTIONS = [
  "24 gesture definitions",
  "MediaPipe hand tracker",
  "pose + motion features",
  "24-rule classifier",
  "threaded voice engine",
  "webcam loop + quiz mode",
];

function CmdChip({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(cmd).catch(() => {}); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}
      className="group flex items-center gap-2 rounded-lg border border-cardline bg-abyss/70 px-3 py-2 font-mono text-[12px] text-inkbody/90 transition hover:border-pulse/60"
      title="Copy command"
    >
      <Terminal size={13} className="shrink-0 text-pulse" />
      <span className="truncate">{cmd}</span>
      {copied ? <Check size={13} className="shrink-0 text-good" /> : <Copy size={13} className="shrink-0 text-inkdim opacity-0 transition group-hover:opacity-100" />}
    </button>
  );
}

export default function CodeLab() {
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard?.writeText(PY_SOURCE).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const html = useMemo(
    () => (Prism.languages.python ? Prism.highlight(PY_SOURCE, Prism.languages.python, "python") : PY_SOURCE.replace(/</g, "&lt;")),
    [],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-cardline bg-card">
      {/* command bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cardline bg-deep/60 px-4 py-3">
        <span className="mr-1 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">Run it</span>
        <CmdChip cmd={PY_INSTALL_CMD} />
        {PY_RUN_CMDS.map((c) => <CmdChip key={c} cmd={c} />)}
      </div>

      {/* file header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cardline px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pulse/12 ring-1 ring-pulse/35">
            <FileCode2 size={18} className="text-pulse" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[14px] font-bold text-inkcard">{PY_FILENAME}</p>
            <p className="text-[11px] text-inkdim">one self-contained program · {PY_LINES} lines · Python 3.9+</p>
          </div>
        </div>
        <button
          onClick={copyAll}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
            copied ? "bg-good text-abyss" : "bg-pulse text-abyss hover:brightness-110"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy full program"}
        </button>
      </div>

      {/* code pane */}
      <pre className="codelab max-h-[620px] overflow-auto !m-0 !bg-transparent p-4 text-[12.5px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>

      {/* what's inside */}
      <div className="flex flex-wrap items-center gap-2 border-t border-cardline bg-deep/40 px-4 py-3">
        <span className="mr-1 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">
          <Layers size={13} className="text-pulse" /> Inside the file
        </span>
        {SECTIONS.map((s, i) => (
          <span key={s} className="rounded-full border border-cardline px-2.5 py-1 text-[11px] text-inkbody/80">
            <span className="mr-1 font-display font-bold text-pulse">{i + 1}</span>{s}
          </span>
        ))}
      </div>
    </div>
  );
}
