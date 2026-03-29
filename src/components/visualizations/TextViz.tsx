import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
}

type TextStep = {
  textHighlight: number[];
  patternPos: number;
  patternHighlight: number[];
  matchFound?: number;
  info?: string;
  /** Cumulative log lines (e.g. Rabin-Karp + LogTracer panel) */
  logs?: string[];
  /** KMP Pattern panel: LPS row + pattern row highlights (column indices in pattern). */
  kmpLps?: number[];
  kmpLpsHighlightCols?: number[];
  kmpPhase?: "lps" | "search";
};

function naiveSearch(text: string, pattern: string): TextStep[] {
  const steps: TextStep[] = [];
  for (let i = 0; i <= text.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      steps.push({ textHighlight: [i + j], patternPos: i, patternHighlight: [j], info: `Compare text[${i + j}] with pattern[${j}]` });
      if (text[i + j] !== pattern[j]) break;
      if (j === pattern.length - 1) {
        steps.push({ textHighlight: Array.from({ length: pattern.length }, (_, k) => i + k), patternPos: i, patternHighlight: Array.from({ length: pattern.length }, (_, k) => k), matchFound: i });
      }
    }
  }
  return steps;
}

function kmpSearch(text: string, pattern: string): TextStep[] {
  const steps: TextStep[] = [];
  const m = pattern.length;
  const lps = Array(m).fill(0);

  const pushLps = (cols: number[], info: string) => {
    steps.push({
      textHighlight: [],
      patternPos: 0,
      patternHighlight: [],
      kmpPhase: "lps",
      kmpLps: [...lps],
      kmpLpsHighlightCols: cols,
      info,
    });
  };

  pushLps([0], "Build LPS: lps[0] = 0 (base).");
  let len = 0;
  let i = 1;
  while (i < m) {
    pushLps([i, len], `Compare pattern[${i}]='${pattern[i]}' with pattern[${len}]='${pattern[len]}' (len=${len}).`);
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      pushLps([i], `Match → lps[${i}] = ${len}.`);
      i++;
    } else if (len !== 0) {
      const nextLen = lps[len - 1];
      pushLps([i], `Mismatch → len = lps[${len - 1}] = ${nextLen}.`);
      len = nextLen;
    } else {
      lps[i] = 0;
      pushLps([i], `len = 0 → lps[${i}] = 0.`);
      i++;
    }
  }

  const finalLps = [...lps];
  steps.push({
    textHighlight: [],
    patternPos: 0,
    patternHighlight: [],
    kmpPhase: "search",
    kmpLps: finalLps,
    kmpLpsHighlightCols: [],
    info: "LPS ready — search phase.",
  });

  let ti = 0;
  let pi = 0;
  while (ti < text.length) {
    steps.push({
      textHighlight: [ti],
      patternPos: ti - pi,
      patternHighlight: [pi],
      kmpPhase: "search",
      kmpLps: finalLps,
      kmpLpsHighlightCols: [pi],
      info: `Compare text[${ti}]='${text[ti]}' with pattern[${pi}]='${pattern[pi]}'`,
    });
    if (text[ti] === pattern[pi]) {
      ti++;
      pi++;
      if (pi === m) {
        const start = ti - pi;
        steps.push({
          textHighlight: Array.from({ length: m }, (_, k) => start + k),
          patternPos: start,
          patternHighlight: Array.from({ length: m }, (_, k) => k),
          matchFound: start,
          kmpPhase: "search",
          kmpLps: finalLps,
          kmpLpsHighlightCols: Array.from({ length: m }, (_, k) => k),
          info: `Match found at index ${start}!`,
        });
        pi = lps[pi - 1];
      }
    } else {
      if (pi !== 0) {
        const newPi = lps[pi - 1];
        steps.push({
          textHighlight: [ti],
          patternPos: ti - newPi,
          patternHighlight: [],
          kmpPhase: "search",
          kmpLps: finalLps,
          kmpLpsHighlightCols: [pi, newPi],
          info: `Mismatch → pi = lps[${pi - 1}] = ${newPi}`,
        });
        pi = newPi;
      } else {
        steps.push({
          textHighlight: [ti],
          patternPos: ti,
          patternHighlight: [],
          kmpPhase: "search",
          kmpLps: finalLps,
          kmpLpsHighlightCols: [],
          info: `Mismatch at start of pattern → advance text index.`,
        });
        ti++;
      }
    }
  }

  steps.push({
    textHighlight: [],
    patternPos: Math.max(0, text.length - m),
    patternHighlight: [],
    kmpPhase: "search",
    kmpLps: finalLps,
    kmpLpsHighlightCols: [],
    info: "Search finished.",
  });

  return steps;
}

function rabinKarpSearch(text: string, pattern: string): TextStep[] {
  const steps: TextStep[] = [];
  const logs: string[] = [];
  const d = 256, q = 101;
  const m = pattern.length;
  if (m === 0 || text.length < m) return steps;

  let pHash = 0, tHash = 0, h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * d) % q;
  for (let i = 0; i < m; i++) {
    pHash = (d * pHash + pattern.charCodeAt(i)) % q;
    tHash = (d * tHash + text.charCodeAt(i)) % q;
  }
  logs.push(`pattern hash pHash = ${pHash}`);
  logs.push(`first window tHash (text[0..${m - 1}]) = ${tHash}`);

  for (let i = 0; i <= text.length - m; i++) {
    const window = Array.from({ length: m }, (_, k) => i + k);
    logs.push(`i=${i}: compare pHash (${pHash}) with tHash (${tHash})`);
    steps.push({
      textHighlight: window,
      patternPos: i,
      patternHighlight: [],
      logs: [...logs],
      info: `Hash compare at position ${i}`,
    });
    if (pHash === tHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        logs.push(
          `Verify j=${j}: text[${i + j}]='${text[i + j] ?? ""}' vs pattern[${j}]='${pattern[j] ?? ""}'`,
        );
        steps.push({
          textHighlight: [i + j],
          patternPos: i,
          patternHighlight: [j],
          logs: [...logs],
          info: `Hash match — verifying character ${j}`,
        });
        if (text[i + j] !== pattern[j]) {
          match = false;
          logs.push(`Mismatch at j=${j} — spurious hash hit`);
          steps.push({
            textHighlight: window,
            patternPos: i,
            patternHighlight: [],
            logs: [...logs],
            info: `Spurious hit at ${i}`,
          });
          break;
        }
      }
      if (match) {
        logs.push(`Match confirmed at index ${i}`);
        steps.push({
          textHighlight: window,
          patternPos: i,
          patternHighlight: Array.from({ length: m }, (_, k) => k),
          matchFound: i,
          logs: [...logs],
          info: `Match at ${i}!`,
        });
      }
    } else {
      logs.push("Hashes differ — skip character comparison");
    }
    if (i < text.length - m) {
      const prev = tHash;
      tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (tHash < 0) tHash += q;
      logs.push(`Rolling hash: ${prev} → ${tHash} (drop '${text[i]}', add '${text[i + m]}')`);
    }
  }
  return steps;
}

function zSearch(text: string, pattern: string): TextStep[] {
  const s = pattern + "$" + text;
  const n = s.length;
  const z = Array(n).fill(0);
  const steps: TextStep[] = [];
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] > r) { l = i; r = i + z[i]; }
    if (z[i] === pattern.length) {
      const pos = i - pattern.length - 1;
      steps.push({
        textHighlight: Array.from({ length: pattern.length }, (_, k) => pos + k),
        patternPos: pos,
        patternHighlight: Array.from({ length: pattern.length }, (_, k) => k),
        matchFound: pos,
        info: `Z-match at position ${pos}`
      });
    } else if (i > pattern.length) {
      steps.push({
        textHighlight: [i - pattern.length - 1],
        patternPos: i - pattern.length - 1,
        patternHighlight: [],
        info: `Z[${i}] = ${z[i]}`
      });
    }
  }
  return steps;
}

function caesarCipherSteps(text: string): TextStep[] {
  const steps: TextStep[] = [];
  const shift = 3;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch.match(/[A-Z]/)) {
      const shifted = String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
      steps.push({ textHighlight: [i], patternPos: 0, patternHighlight: [], info: `${ch} → ${shifted} (shift +${shift})` });
    } else {
      steps.push({ textHighlight: [i], patternPos: 0, patternHighlight: [], info: `${ch} unchanged` });
    }
  }
  return steps;
}

function affineCipherSteps(text: string): TextStep[] {
  const steps: TextStep[] = [];
  const a = 5, b = 8;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch.match(/[A-Z]/)) {
      const x = ch.charCodeAt(0) - 65;
      const encrypted = String.fromCharCode(((a * x + b) % 26) + 65);
      steps.push({ textHighlight: [i], patternPos: 0, patternHighlight: [], info: `${ch} → ${encrypted} (${a}×${x}+${b} mod 26)` });
    } else {
      steps.push({ textHighlight: [i], patternPos: 0, patternHighlight: [], info: `${ch} unchanged` });
    }
  }
  return steps;
}

function suffixArraySteps(text: string): TextStep[] {
  const steps: TextStep[] = [];
  const suffixes = text.split("").map((_, i) => ({ idx: i, suffix: text.substring(i) }));
  suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix));
  for (let i = 0; i < suffixes.length; i++) {
    steps.push({
      textHighlight: Array.from({ length: text.length - suffixes[i].idx }, (_, k) => suffixes[i].idx + k),
      patternPos: 0,
      patternHighlight: [],
      info: `SA[${i}] = ${suffixes[i].idx}: "${suffixes[i].suffix}"`
    });
  }
  return steps;
}

function getTextSteps(name: string): { text: string; pattern: string; steps: TextStep[] } {
  const text = "ABCABCDABABCDABCDABDE";
  const pattern = "ABCDABD";
  /** algorithm-visualizer.org demo: pattern AAAABAAA, text length 21 */
  if (name.includes("KMP") || name.includes("Knuth-Morris")) {
    const kmpText = "AAAABAAABAAAABAAABAAA";
    const kmpPattern = "AAAABAAA";
    return { text: kmpText, pattern: kmpPattern, steps: kmpSearch(kmpText, kmpPattern) };
  }
  if (name.includes("Rabin-Karp")) return { text, pattern, steps: rabinKarpSearch(text, pattern) };
  if (name.includes("Z String")) return { text, pattern, steps: zSearch(text, pattern) };
  if (name.includes("Caesar")) return { text: "HELLO WORLD", pattern: "", steps: caesarCipherSteps("HELLO WORLD") };
  if (name.includes("Affine")) return { text: "HELLO WORLD", pattern: "", steps: affineCipherSteps("HELLO WORLD") };
  if (name.includes("Suffix")) return { text: "BANANA", pattern: "", steps: suffixArraySteps("BANANA") };
  return { text, pattern, steps: naiveSearch(text, pattern) };
}

export function TextViz({ isPlaying, speed, algorithmName }: Props) {
  const config = useRef(getTextSteps(algorithmName));
  const [step, setStep] = useState<TextStep | null>(null);
  const stepRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    config.current = getTextSteps(algorithmName);
    reset();
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying && config.current.steps.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= config.current.steps.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setStep(config.current.steps[stepRef.current]);
        stepRef.current++;
      }, Math.max(50, 500 - speed * 45));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => { setStep(null); stepRef.current = 0; };

  const { text, pattern } = config.current;
  const isCipher = algorithmName.includes("Caesar") || algorithmName.includes("Affine");
  const isSuffix = algorithmName.includes("Suffix");
  const isRabinKarp = algorithmName.includes("Rabin-Karp");
  const isKmp = algorithmName.includes("KMP") || algorithmName.includes("Knuth-Morris");
  const showPatternRow =
    !isCipher && !isSuffix && !isKmp && pattern && (step !== null || isRabinKarp);
  const patternPos = step?.patternPos ?? 0;
  const patternHighlight = step?.patternHighlight ?? [];

  if (isKmp && !step) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-2">
        <div className="text-xs text-muted-foreground text-center">
          {algorithmName} — Press Play for Pattern + String
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Reset
        </button>
      </div>
    );
  }

  if (isKmp && step) {
    const m = pattern.length;
    const lpsRow = step.kmpLps ?? Array(m).fill(0);
    const lpsCols = step.kmpLpsHighlightCols ?? [];
    const patCols = step.patternHighlight;
    const highlightLpsCell = (j: number) =>
      lpsCols.includes(j) || (step.kmpPhase === "search" && patCols.includes(j));
    const highlightPatCell = (j: number) =>
      step.kmpPhase === "lps"
        ? lpsCols.includes(j)
        : patCols.length > 0
          ? patCols.includes(j)
          : lpsCols.includes(j);

    const cellPattern = (highlight: boolean) => ({
      background: highlight ? "hsl(45, 65%, 26%)" : "hsl(150, 15%, 12%)",
      color: highlight ? "hsl(45, 95%, 88%)" : "hsl(150, 20%, 78%)",
      border: `1px solid ${highlight ? "hsl(45, 75%, 42%)" : "hsl(150, 15%, 22%)"}`,
    });

    const cellText = (i: number) => {
      const inMatch =
        step.matchFound !== undefined &&
        i >= step.matchFound &&
        i < step.matchFound + m;
      const hi = step.textHighlight.includes(i);
      return {
        background: inMatch
          ? "hsl(145, 60%, 32%)"
          : hi
            ? "hsl(45, 65%, 26%)"
            : "hsl(150, 15%, 12%)",
        color: inMatch
          ? "hsl(150, 30%, 6%)"
          : hi
            ? "hsl(45, 95%, 88%)"
            : "hsl(150, 20%, 78%)",
        border: `1px solid ${
          inMatch ? "hsl(145, 55%, 40%)" : hi ? "hsl(45, 75%, 42%)" : "hsl(150, 15%, 22%)"
        }`,
      };
    };

    return (
      <div className="w-full h-full flex flex-col min-h-0 gap-3 px-1 py-1 overflow-auto font-mono">
        <div className="text-[10px] text-muted-foreground shrink-0">{algorithmName}</div>

        <div className="shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">Pattern</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
            <table className="border-collapse text-center">
              <thead>
                <tr>
                  <th className="w-6 h-6 sm:w-7 sm:h-7" />
                  {Array.from({ length: m }, (_, j) => (
                    <th
                      key={`pch-${j}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-[8px] sm:text-[9px] text-muted-foreground font-normal px-0.5"
                    >
                      {j}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-[8px] sm:text-[9px] text-muted-foreground pr-1">0</td>
                  {lpsRow.map((v, j) => (
                    <td
                      key={`lps-${j}`}
                      className="w-6 h-7 sm:w-7 sm:h-8 text-[10px] sm:text-xs transition-colors duration-100"
                      style={cellPattern(highlightLpsCell(j))}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-[8px] sm:text-[9px] text-muted-foreground pr-1">1</td>
                  {pattern.split("").map((ch, j) => (
                    <td
                      key={`pch-${j}`}
                      className="w-6 h-7 sm:w-7 sm:h-8 text-[10px] sm:text-xs transition-colors duration-100"
                      style={cellPattern(highlightPatCell(j))}
                    >
                      {ch}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">String</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
            <div className="flex flex-col gap-0.5 min-w-min">
              <div className="flex gap-0.5">
                {text.split("").map((_, i) => (
                  <div
                    key={`ti-${i}`}
                    className="w-5 h-5 sm:w-5 shrink-0 flex items-center justify-center text-[7px] sm:text-[8px] text-muted-foreground"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {text.split("").map((ch, i) => (
                  <div
                    key={`tch-${i}`}
                    className="w-5 h-7 sm:w-5 sm:h-8 shrink-0 flex items-center justify-center text-[10px] sm:text-xs transition-colors duration-100"
                    style={cellText(i)}
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {step.info && (
          <div className="text-[10px] text-muted-foreground font-mono px-1 text-center shrink-0">
            {step.info}
          </div>
        )}

        <button
          type="button"
          onClick={reset}
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors mx-auto shrink-0"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-xs text-muted-foreground">{algorithmName}</div>
      <div className={`flex flex-col gap-3 font-mono w-full max-w-full ${isRabinKarp ? "px-2" : ""}`}>
        {isRabinKarp && <div className="text-[10px] text-muted-foreground mb-2">text</div>}
        <div className="flex gap-0.5">
          {text.split("").map((ch, i) => (
            <span
              key={i}
              className="w-6 h-8 flex items-center justify-center text-xs rounded transition-all duration-100"
              style={{
                background: step?.matchFound !== undefined && i >= step.matchFound && i < step.matchFound + pattern.length
                  ? "hsl(145, 60%, 35%)"
                  : step?.textHighlight?.includes(i)
                  ? "hsl(45, 70%, 30%)"
                  : "hsl(150, 15%, 12%)",
                color: step?.matchFound !== undefined && i >= step.matchFound && i < step.matchFound + pattern.length
                  ? "hsl(150, 30%, 4%)"
                  : step?.textHighlight?.includes(i)
                  ? "hsl(45, 90%, 80%)"
                  : "hsl(150, 20%, 80%)",
                border: "1px solid hsl(150, 15%, 20%)",
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        {showPatternRow && (
          <>
            {isRabinKarp && <div className="text-[10px] text-muted-foreground mb-2 mt-1">pattern</div>}
            <div className="flex gap-0.5" style={{ paddingLeft: `${patternPos * 26}px` }}>
              {pattern.split("").map((ch, i) => (
                <span
                  key={i}
                  className="w-6 h-8 flex items-center justify-center text-xs rounded border border-primary/40 text-primary"
                  style={{
                    background: patternHighlight.includes(i) ? "hsl(145, 60%, 45%, 0.2)" : "hsl(145, 60%, 45%, 0.05)",
                    fontWeight: patternHighlight.includes(i) ? 700 : 400,
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
      {isRabinKarp ? (
        <div className="w-full max-w-lg mt-2 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {(step?.logs?.length ?? 0) > 0 ? (
              (step?.logs ?? []).slice(-8).map((entry, index) => (
                <div key={`${index}-${entry.slice(0, 40)}`}>{entry}</div>
              ))
            ) : (
              <div>Press play to start the search.</div>
            )}
          </div>
        </div>
      ) : (
        step?.info && (
          <div className="text-[10px] text-muted-foreground font-mono px-4 text-center">{step.info}</div>
        )
      )}
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
    </div>
  );
}
