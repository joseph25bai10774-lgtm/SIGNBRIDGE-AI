import { useState, type ReactNode } from "react";
import {
  Download, Monitor, Puzzle, FolderPlus, Keyboard, FlaskConical, PackagePlus, Play,
  Wrench, Copy, Check, FolderTree, AlertTriangle, ChevronDown, ExternalLink, Cpu,
} from "lucide-react";

type OS = "win" | "mac" | "linux";
const OS_LABEL: Record<OS, string> = { win: "Windows", mac: "macOS", linux: "Linux" };

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };
  return { copied, copy };
}

function Cmd({ id, text }: { id: string; text: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      onClick={() => copy(id, text)}
      className="group flex w-full items-center gap-2 rounded-md border border-cardline bg-abyss/80 px-3 py-2 text-left font-mono text-[12.5px] text-inkbody transition hover:border-pulse/60"
    >
      <span className="select-none text-pulse">$</span>
      <span className="flex-1 truncate">{text}</span>
      {copied === id ? <Check size={13} className="shrink-0 text-good" /> : <Copy size={13} className="shrink-0 text-inkdim opacity-0 transition group-hover:opacity-100" />}
    </button>
  );
}

function OsTabs({ os, setOs }: { os: OS; setOs: (o: OS) => void }) {
  return (
    <div className="mb-2 inline-flex rounded-lg border border-cardline bg-deep p-0.5">
      {(Object.keys(OS_LABEL) as OS[]).map((k) => (
        <button
          key={k}
          onClick={() => setOs(k)}
          className={`rounded-md px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider transition ${
            os === k ? "bg-pulse text-abyss" : "text-inkdim hover:text-inkbody"
          }`}
        >
          {OS_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

function Step({ n, icon: Icon, title, children }: { n: number; icon: typeof Download; title: string; children: ReactNode }) {
  return (
    <li className="reveal relative pl-14 sm:pl-16">
      <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-xl border border-cardline-bright bg-card font-display text-sm font-extrabold text-pulse shadow-[0_0_0_4px_rgba(6,18,31,1)] sm:h-11 sm:w-11">
        {n}
      </span>
      <span className="absolute left-5 top-12 bottom-[-24px] w-px bg-cardline/70 sm:left-[22px]" />
      <div className="rounded-xl border border-cardline bg-card p-5 transition hover:border-cardline-bright">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-inkcard">
          <Icon size={17} className="text-pulse" /> {title}
        </h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-inkbody/88">{children}</div>
      </div>
    </li>
  );
}

const EXTENSIONS = [
  { id: "ms-python.python", name: "Python", why: "Core language support: IntelliSense, linting, run-in-terminal, interpreter picker.", must: true },
  { id: "ms-python.vscode-pylance", name: "Pylance", why: "Fast type-checking and auto-imports so mistakes surface before you run.", must: true },
  { id: "ms-python.debugpy", name: "Python Debugger", why: "Breakpoints, step-through and variable watch when you press F5.", must: true },
  { id: "ms-python.black-formatter", name: "Black Formatter", why: "One-key consistent formatting (Shift+Alt+F) for clean submissions.", must: false },
  { id: "ms-toolsai.jupyter", name: "Jupyter", why: "Optional: experiment with the classifier cell-by-cell in notebooks.", must: false },
  { id: "eamodio.gitlens", name: "GitLens", why: "Optional: track versions of your project as you improve the model.", must: false },
];

const TROUBLE = [
  { q: "“python is not recognized as an internal command” (Windows)", a: "Re-run the Python installer and tick “Add python.exe to PATH”, or use the py launcher: py -m pip install … and py signbridge_ai.py." },
  { q: "Camera window is black / “Could not open camera 0”", a: "Close other apps using the camera (Zoom, Teams, browser tabs), check OS privacy settings allow camera for terminal/VS Code, then run again." },
  { q: "pyttsx3 is silent on Linux", a: "It needs a speech backend. Debian/Ubuntu: sudo apt install espeak-ng libespeak-ng1. Fedora: sudo dnf install espeak-ng." },
  { q: "pyttsx3 crashes on macOS", a: "Install the Cocoa bridge it uses: pip install pyobjc-framework-Cocoa. Voice replies will then use the system voices." },
  { q: "mediapipe fails to install on Apple Silicon / new Python", a: "Use Python 3.10 or 3.11 in a conda env (conda create -n signbridge python=3.11). Wheels exist for those versions on arm64." },
  { q: "Recognition feels jittery or never commits", a: "Improve lighting, face your palm to the camera, and sign slightly larger and slower. A gesture must hold ~0.75 s to commit — that is deliberate debouncing." },
];

export default function SetupGuide() {
  const [os, setOs] = useState<OS>("win");
  const { copied, copy } = useCopy();
  const allExt = EXTENSIONS.filter((e) => e.must).map((e) => e.id).join(" ");

  const mkdirCmd: Record<OS, string> = {
    win: "mkdir signbridge-ai && cd signbridge-ai",
    mac: "mkdir signbridge-ai && cd signbridge-ai",
    linux: "mkdir signbridge-ai && cd signbridge-ai",
  };
  const venvCmd: Record<OS, [string, string]> = {
    win: ["py -m venv venv", "venv\\Scripts\\activate"],
    mac: ["python3 -m venv venv", "source venv/bin/activate"],
    linux: ["python3 -m venv venv", "source venv/bin/activate"],
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* ---------------- timeline ---------------- */}
      <ol className="space-y-6">
        <Step n={1} icon={Download} title="Install Python 3.10 or 3.11">
          <p>Download it from <span className="font-semibold text-pulse">python.org/downloads</span>. On Windows, <strong className="text-inkbody">tick “Add python.exe to PATH”</strong> on the first installer screen — it saves you a classic headache later. Verify with:</p>
          <Cmd id="pyver" text={os === "win" ? "py --version" : "python3 --version"} />
        </Step>

        <Step n={2} icon={Monitor} title="Install Visual Studio Code">
          <p>Grab it from <span className="font-semibold text-pulse">code.visualstudio.com</span>. It is free, and it is where the whole project will live — editor, terminal and debugger in one window.</p>
        </Step>

        <Step n={3} icon={Puzzle} title="Add the Python extensions">
          <p>Open VS Code → the Extensions icon in the left bar (or <kbd className="rounded bg-deep px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-cardline">Ctrl+Shift+X</kbd>). Install these:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXTENSIONS.map((e) => (
              <div key={e.id} className="rounded-lg border border-cardline bg-deep/50 p-3">
                <p className="flex items-center justify-between font-display text-[13px] font-bold text-inkbody">
                  {e.name}
                  {e.must ? <span className="rounded-full bg-pulse/15 px-2 py-0.5 text-[9px] uppercase tracking-wider text-pulse">required</span> : <span className="rounded-full bg-cardline/30 px-2 py-0.5 text-[9px] uppercase tracking-wider text-inkdim">optional</span>}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-inkdim">{e.why}</p>
                <p className="mt-1.5 truncate font-mono text-[10.5px] text-inkdim/80">{e.id}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copy("exts", `code --install-extension ${allExt}`)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition active:scale-95 ${copied === "exts" ? "bg-good text-abyss" : "bg-pulse text-abyss hover:brightness-110"}`}
            >
              {copied === "exts" ? <Check size={13} /> : <Copy size={13} />}
              {copied === "exts" ? "Copied!" : "Copy install-all command"}
            </button>
            <span className="text-[11px] text-inkdim">Paste it in any terminal to install the required set in one shot.</span>
          </div>
        </Step>

        <Step n={4} icon={FolderPlus} title="Create the project folder & save the program">
          <p>Make a folder anywhere (Documents works), then save the copied program inside it as <code className="rounded bg-deep px-1.5 py-0.5 font-mono text-[12px] text-pulse">signbridge_ai.py</code>:</p>
          <OsTabs os={os} setOs={setOs} />
          <Cmd id="mkdir" text={mkdirCmd[os]} />
          <p className="text-[12.5px] text-inkdim">In VS Code: File → Open Folder… → choose <code className="font-mono">signbridge-ai</code>. Then File → New File, paste the program, Save As <code className="font-mono">signbridge_ai.py</code>.</p>
        </Step>

        <Step n={5} icon={Keyboard} title="Pick the Python interpreter">
          <p>Press <kbd className="rounded bg-deep px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-cardline">Ctrl+Shift+P</kbd> (Mac: <kbd className="rounded bg-deep px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-cardline">Cmd+Shift+P</kbd>), type <strong className="text-inkbody">Python: Select Interpreter</strong>, and choose the Python 3.10/3.11 you installed (or the virtual env from the next step once it exists). The chosen one shows in the bottom status bar.</p>
        </Step>

        <Step n={6} icon={FlaskConical} title="Create a virtual environment (recommended)">
          <p>A venv keeps this project's packages separate from everything else on your machine. In the VS Code integrated terminal (<kbd className="rounded bg-deep px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-cardline">Ctrl+`</kbd>):</p>
          <OsTabs os={os} setOs={setOs} />
          <Cmd id="venv1" text={venvCmd[os][0]} />
          <Cmd id="venv2" text={venvCmd[os][1]} />
          <p className="text-[12.5px] text-inkdim">Using Conda instead? <code className="font-mono text-inkbody">conda create -n signbridge python=3.11 -y</code> then <code className="font-mono text-inkbody">conda activate signbridge</code>. VS Code will offer to use the venv automatically — say yes.</p>
        </Step>

        <Step n={7} icon={PackagePlus} title="Install the three packages">
          <p>Still in the terminal, with the venv active (you'll see <code className="font-mono text-good">(venv)</code> at the start of the line):</p>
          <Cmd id="pip" text="pip install opencv-python mediapipe pyttsx3" />
          <p className="text-[12.5px] text-inkdim">First run downloads ~150 MB of wheels (OpenCV + the MediaPipe model runtime). Linux users also need <code className="font-mono text-inkbody">sudo apt install espeak-ng</code> for speech.</p>
        </Step>

        <Step n={8} icon={Play} title="Run the program">
          <p>Three ways, all equivalent:</p>
          <Cmd id="run1" text="python signbridge_ai.py" />
          <p className="text-[12.5px] text-inkdim">…or press the ▶ button top-right of the editor, or hit <kbd className="rounded bg-deep px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-cardline">F5</kbd> to run under the debugger with breakpoints. A window opens with your camera feed, the hand skeleton and the live HUD. Allow camera access when asked.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full border border-cardline px-2.5 py-1 font-mono text-[11px] text-inkbody/85">--test <span className="text-inkdim">quiz mode</span></span>
            <span className="rounded-full border border-cardline px-2.5 py-1 font-mono text-[11px] text-inkbody/85">--no-voice <span className="text-inkdim">text only</span></span>
            <span className="rounded-full border border-cardline px-2.5 py-1 font-mono text-[11px] text-inkbody/85">Q / V / T <span className="text-inkdim">in-app keys</span></span>
          </div>
        </Step>
      </ol>

      {/* ---------------- sidebar ---------------- */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="reveal rounded-xl border border-cardline bg-card p-4">
          <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">
            <FolderTree size={13} className="text-pulse" /> Your folder, finally
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-inkbody/90">{`signbridge-ai/
├── signbridge_ai.py   ← the whole program
├── venv/              ← made in step 6
└── (nothing else needed)`}</pre>
        </div>

        <div className="reveal rounded-xl border border-cardline bg-card p-4">
          <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">
            <Cpu size={13} className="text-pulse" /> What you need
          </p>
          <ul className="mt-3 space-y-2 text-[13px] text-inkbody/88">
            <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-good" /> Python 3.10 – 3.11</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-good" /> VS Code + Python extensions</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-good" /> Any webcam (laptop camera is fine)</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-good" /> Decent front lighting</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-good" /> ~250 MB disk for packages</li>
          </ul>
        </div>

        <div className="reveal rounded-xl border border-cardline bg-card p-4">
          <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">
            <ExternalLink size={13} className="text-pulse" /> Downloads
          </p>
          <div className="mt-3 space-y-2 text-[13px]">
            <a href="https://www.python.org/downloads/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-cardline px-3 py-2 text-inkbody transition hover:border-pulse hover:text-pulse">
              Python installer <ExternalLink size={12} />
            </a>
            <a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-cardline px-3 py-2 text-inkbody transition hover:border-pulse hover:text-pulse">
              Visual Studio Code <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="reveal rounded-xl border border-cardline bg-card p-4">
          <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-inkdim">
            <Wrench size={13} className="text-warn" /> Troubleshooting
          </p>
          <div className="mt-2 space-y-1.5">
            {TROUBLE.map((t) => (
              <details key={t.q} className="deepline group rounded-lg border border-cardline/70 bg-deep/40 open:border-warn/40">
                <summary className="flex items-start gap-2 px-3 py-2.5 text-[12.5px] font-semibold leading-snug text-inkbody/90">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warn" />
                  <span className="flex-1">{t.q}</span>
                  <ChevronDown size={14} className="chev mt-0.5 shrink-0 text-inkdim" />
                </summary>
                <p className="border-t border-cardline/60 px-3 py-2.5 text-[12.5px] leading-relaxed text-inkdim">{t.a}</p>
              </details>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
