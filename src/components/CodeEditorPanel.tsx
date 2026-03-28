import { useState } from "react";
import { AlgorithmInfo } from "@/data/algorithms";
import { Play, Pause, RotateCcw, Gauge } from "lucide-react";
import { renderHighlightedCode } from "@/lib/codeHighlight";
import { getActiveCodeLine, CodeLang } from "@/lib/codeExecution";

interface Props {
  algorithm: AlgorithmInfo | null;
  isPlaying: boolean;
  speed: number;
  activeCodeMarker: string | null;
  stepLogs: string[];
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function CodeEditorPanel({ algorithm, isPlaying, speed, activeCodeMarker, stepLogs, onTogglePlay, onReset, onSpeedChange }: Props) {
  const [lang, setLang] = useState<CodeLang>("javascript");

  const langs: { key: CodeLang; label: string }[] = [
    { key: "javascript", label: "JavaScript" },
    { key: "java", label: "Java" },
    { key: "c", label: "C" },
  ];

  const code = algorithm?.code[lang] ?? "";
  const activeLine = algorithm ? getActiveCodeLine(algorithm.name, lang, activeCodeMarker, code) : null;
  const lines = code.split("\n");

  return (
    <div className="w-80 h-full flex flex-col gap-3">
      {/* Controls */}
      <div className="glass-strong rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Controls</span>
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Speed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            disabled={!algorithm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-30"
            style={{
              background: isPlaying
                ? "hsl(0, 70%, 45%)"
                : "hsl(145, 60%, 45%)",
              color: "hsl(150, 30%, 4%)",
              boxShadow: `0 0 15px ${isPlaying ? "hsl(0, 70%, 45%, 0.3)" : "hsl(145, 60%, 45%, 0.3)"}`,
            }}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-primary h-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Language tabs + code */}
      <div className="flex-1 glass-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="flex border-b border-border/30">
          {langs.map(l => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all ${
                lang === l.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          {algorithm ? (
            <pre className="text-[11px] leading-relaxed font-mono text-secondary-foreground whitespace-pre rounded-xl bg-black/20 p-3 border border-border/30 shadow-inner overflow-x-auto">
              <code>
                {lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isActive = lineNumber === activeLine;
                  return (
                    <div
                      key={lineNumber}
                      className={`grid grid-cols-[2.2rem_1fr] items-start rounded-md transition-colors ${
                        isActive ? "bg-emerald-500/12 shadow-[inset_3px_0_0_0_rgba(16,185,129,0.95)]" : ""
                      }`}
                    >
                      <span
                        className={`select-none pr-3 text-right ${
                          isActive ? "text-emerald-300" : "text-muted-foreground/60"
                        }`}
                      >
                        {lineNumber}
                      </span>
                      <span className={`block min-w-0 ${isActive ? "text-foreground" : ""}`}>
                        {renderHighlightedCode(line)}
                        {index < lines.length - 1 ? "\n" : ""}
                      </span>
                    </div>
                  );
                })}
              </code>
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground text-center mt-8">
              Select an algorithm to view code
            </p>
          )}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-4 min-h-32 max-h-40 overflow-auto">
        <div className="text-xs font-medium text-foreground mb-3">Step Log</div>
        {stepLogs.length > 0 ? (
          <div className="space-y-2">
            {stepLogs.map((log, index) => (
              <p key={`${index}-${log}`} className="text-[11px] leading-relaxed text-muted-foreground">
                {log}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Play an algorithm to see step-by-step logs here.</p>
        )}
      </div>
    </div>
  );
}
