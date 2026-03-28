import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
}

type TextStep = { textHighlight: number[]; patternPos: number; patternHighlight: number[]; matchFound?: number; info?: string };

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
  // Build failure function
  const lps = Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }
    else if (len !== 0) len = lps[len - 1];
    else { lps[i] = 0; i++; }
  }
  // Search
  let ti = 0, pi = 0;
  while (ti < text.length) {
    steps.push({ textHighlight: [ti], patternPos: ti - pi, patternHighlight: [pi], info: `KMP: Compare text[${ti}] with pattern[${pi}]` });
    if (text[ti] === pattern[pi]) {
      ti++; pi++;
      if (pi === pattern.length) {
        const start = ti - pi;
        steps.push({ textHighlight: Array.from({ length: pattern.length }, (_, k) => start + k), patternPos: start, patternHighlight: Array.from({ length: pattern.length }, (_, k) => k), matchFound: start, info: `Match found at ${start}!` });
        pi = lps[pi - 1];
      }
    } else {
      if (pi !== 0) {
        pi = lps[pi - 1];
        steps.push({ textHighlight: [], patternPos: ti - pi, patternHighlight: [], info: `KMP: Shift using LPS, pi=${pi}` });
      } else {
        ti++;
      }
    }
  }
  return steps;
}

function rabinKarpSearch(text: string, pattern: string): TextStep[] {
  const steps: TextStep[] = [];
  const d = 256, q = 101;
  const m = pattern.length;
  let pHash = 0, tHash = 0, h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * d) % q;
  for (let i = 0; i < m; i++) {
    pHash = (d * pHash + pattern.charCodeAt(i)) % q;
    tHash = (d * tHash + text.charCodeAt(i)) % q;
  }
  for (let i = 0; i <= text.length - m; i++) {
    const window = Array.from({ length: m }, (_, k) => i + k);
    steps.push({ textHighlight: window, patternPos: i, patternHighlight: [], info: `Hash compare at pos ${i}` });
    if (pHash === tHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        steps.push({ textHighlight: [i + j], patternPos: i, patternHighlight: [j], info: `Hash match! Verifying char ${j}` });
        if (text[i + j] !== pattern[j]) { match = false; break; }
      }
      if (match) {
        steps.push({ textHighlight: window, patternPos: i, patternHighlight: Array.from({ length: m }, (_, k) => k), matchFound: i, info: `Match at ${i}!` });
      }
    }
    if (i < text.length - m) {
      tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (tHash < 0) tHash += q;
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
  if (name.includes("KMP") || name.includes("Knuth-Morris")) return { text, pattern, steps: kmpSearch(text, pattern) };
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-xs text-muted-foreground">{algorithmName}</div>
      <div className="flex flex-col gap-3 font-mono">
        <div className="flex gap-0.5">
          {text.split("").map((ch, i) => (
            <span
              key={i}
              className="w-6 h-8 flex items-center justify-center text-xs rounded transition-all duration-100"
              style={{
                background: step?.matchFound !== undefined && i >= step.matchFound && i < step.matchFound + pattern.length
                  ? "hsl(145, 60%, 35%)"
                  : step?.textHighlight.includes(i)
                  ? "hsl(45, 70%, 30%)"
                  : "hsl(150, 15%, 12%)",
                color: step?.matchFound !== undefined && i >= step.matchFound && i < step.matchFound + pattern.length
                  ? "hsl(150, 30%, 4%)"
                  : step?.textHighlight.includes(i)
                  ? "hsl(45, 90%, 80%)"
                  : "hsl(150, 20%, 80%)",
                border: "1px solid hsl(150, 15%, 20%)",
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        {!isCipher && !isSuffix && pattern && step && (
          <div className="flex gap-0.5" style={{ paddingLeft: `${(step.patternPos ?? 0) * 26}px` }}>
            {pattern.split("").map((ch, i) => (
              <span
                key={i}
                className="w-6 h-8 flex items-center justify-center text-xs rounded border border-primary/40 text-primary"
                style={{
                  background: step.patternHighlight.includes(i) ? "hsl(145, 60%, 45%, 0.2)" : "hsl(145, 60%, 45%, 0.05)",
                  fontWeight: step.patternHighlight.includes(i) ? 700 : 400,
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>
      {step?.info && (
        <div className="text-[10px] text-muted-foreground font-mono px-4 text-center">{step.info}</div>
      )}
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
    </div>
  );
}
