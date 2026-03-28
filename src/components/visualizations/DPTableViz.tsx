import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
}

type DPStep = { table: number[] | number[][]; current: [number, number?]; is2D: boolean; labels?: { rows?: string[]; cols?: string[] } };

function fibSteps(n: number): DPStep[] {
  const dp = [0, 1];
  const steps: DPStep[] = [
    { table: [...dp], current: [0], is2D: false },
    { table: [...dp], current: [1], is2D: false },
  ];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function catalanSteps(n: number): DPStep[] {
  const dp = Array(n + 1).fill(0);
  dp[0] = 1; dp[1] = 1;
  const steps: DPStep[] = [
    { table: [...dp], current: [0], is2D: false },
    { table: [...dp], current: [1], is2D: false },
  ];
  for (let i = 2; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      dp[i] += dp[j] * dp[i - 1 - j];
    }
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function factorialSteps(n: number): DPStep[] {
  const dp = [1];
  const steps: DPStep[] = [{ table: [1], current: [0], is2D: false }];
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i - 1] * i;
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function pascalSteps(n: number): DPStep[] {
  const tri: number[][] = [];
  const steps: DPStep[] = [];
  for (let i = 0; i < n; i++) {
    tri[i] = Array(i + 1).fill(0);
    tri[i][0] = 1; tri[i][i] = 1;
    for (let j = 1; j < i; j++) {
      tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
    }
    steps.push({ table: tri.map(r => [...r]), current: [i], is2D: false });
  }
  return steps;
}

function knapsackSteps(): DPStep[] {
  const weights = [2, 3, 4, 5];
  const values = [3, 4, 5, 6];
  const W = 8;
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const steps: DPStep[] = [];
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
      steps.push({
        table: dp.map(r => [...r]),
        current: [i, w],
        is2D: true,
        labels: { rows: ["", ...weights.map((w, i) => `w${w}v${values[i]}`)], cols: Array.from({ length: W + 1 }, (_, i) => String(i)) }
      });
    }
  }
  return steps;
}

function lcsSteps(): DPStep[] {
  const a = "ABCBDAB";
  const b = "BDCAB";
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const steps: DPStep[] = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      steps.push({
        table: dp.map(r => [...r]),
        current: [i, j],
        is2D: true,
        labels: { rows: ["", ...a.split("")], cols: ["", ...b.split("")] }
      });
    }
  }
  return steps;
}

function lisSteps(): DPStep[] {
  const arr = [10, 9, 2, 5, 3, 7, 101, 18, 4, 6, 8];
  const dp = Array(arr.length).fill(1);
  const steps: DPStep[] = [];
  for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function editDistSteps(): DPStep[] {
  const a = "KITTEN";
  const b = "SITTING";
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  const steps: DPStep[] = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      steps.push({
        table: dp.map(r => [...r]),
        current: [i, j],
        is2D: true,
        labels: { rows: ["", ...a.split("")], cols: ["", ...b.split("")] }
      });
    }
  }
  return steps;
}

function lpsSteps(): DPStep[] {
  const s = "BBABCBCAB";
  const n = s.length;
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = 1;
  const steps: DPStep[] = [];
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
      steps.push({ table: dp.map(r => [...r]), current: [i, j], is2D: true, labels: { rows: s.split(""), cols: s.split("") } });
    }
  }
  return steps;
}

function intPartSteps(n: number): DPStep[] {
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;
  const steps: DPStep[] = [{ table: [...dp], current: [0], is2D: false }];
  for (let i = 1; i <= n; i++) {
    for (let j = i; j <= n; j++) {
      dp[j] += dp[j - i];
    }
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function scsSteps(): DPStep[] {
  const a = "AGGTAB";
  const b = "GXTXAYB";
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  const steps: DPStep[] = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;
      steps.push({ table: dp.map(r => [...r]), current: [i, j], is2D: true, labels: { rows: ["", ...a.split("")], cols: ["", ...b.split("")] } });
    }
  }
  return steps;
}

function uglySteps(n: number): DPStep[] {
  const dp = [1];
  let i2 = 0, i3 = 0, i5 = 0;
  const steps: DPStep[] = [{ table: [1], current: [0], is2D: false }];
  for (let i = 1; i < n; i++) {
    const next = Math.min(dp[i2] * 2, dp[i3] * 3, dp[i5] * 5);
    dp.push(next);
    if (next === dp[i2] * 2) i2++;
    if (next === dp[i3] * 3) i3++;
    if (next === dp[i5] * 5) i5++;
    steps.push({ table: [...dp], current: [i], is2D: false });
  }
  return steps;
}

function floydWarshallSteps(): DPStep[] {
  const V = 5;
  const INF = 999;
  const dist: number[][] = [
    [0, 3, INF, 7, INF],
    [8, 0, 2, INF, INF],
    [5, INF, 0, 1, INF],
    [2, INF, INF, 0, 4],
    [INF, INF, 6, INF, 0],
  ];
  const steps: DPStep[] = [];
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
        steps.push({
          table: dist.map(r => [...r]),
          current: [i, j],
          is2D: true,
          labels: { rows: ["0", "1", "2", "3", "4"], cols: ["0", "1", "2", "3", "4"] }
        });
      }
    }
  }
  return steps;
}

function maxSumPathSteps(): DPStep[] {
  const tri = [[3], [7, 4], [2, 4, 6], [8, 5, 9, 3], [1, 6, 7, 4, 2]];
  const n = tri.length;
  const dp: number[][] = tri.map(r => [...r]);
  const steps: DPStep[] = [];
  // Pad to make rectangular
  const maxW = n;
  const table: number[][] = Array.from({ length: n }, (_, i) => {
    const row = Array(maxW).fill(0);
    for (let j = 0; j <= i; j++) row[j] = dp[i][j];
    return row;
  });
  steps.push({ table: table.map(r => [...r]), current: [n - 1, 0], is2D: true });
  for (let i = n - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      dp[i][j] += Math.max(dp[i + 1][j], dp[i + 1][j + 1]);
      const t2: number[][] = Array.from({ length: n }, (_, ii) => {
        const row = Array(maxW).fill(0);
        for (let jj = 0; jj <= ii; jj++) row[jj] = dp[ii][jj];
        return row;
      });
      steps.push({ table: t2, current: [i, j], is2D: true });
    }
  }
  return steps;
}

function millerRabinSteps(): DPStep[] {
  const n = 221; // composite: 13 × 17
  let d = n - 1, r = 0;
  while (d % 2 === 0) { d /= 2; r++; }
  const witnesses = [2, 3, 5];
  const steps: DPStep[] = [];
  for (const a of witnesses) {
    let x = 1;
    let exp = d;
    let base = a % n;
    const row: number[] = [a, base];
    // Modular exponentiation steps
    while (exp > 0) {
      if (exp % 2 === 1) x = (x * base) % n;
      exp = Math.floor(exp / 2);
      base = (base * base) % n;
      row.push(x);
    }
    steps.push({ table: [...row], current: [row.length - 1], is2D: false });
    // Squaring phase
    for (let i = 0; i < r; i++) {
      x = (x * x) % n;
      row.push(x);
      steps.push({ table: [...row], current: [row.length - 1], is2D: false });
    }
  }
  return steps;
}

function freivaldsSteps(): DPStep[] {
  const A = [[1, 2], [3, 4]];
  const B = [[5, 6], [7, 8]];
  const C = [[19, 22], [43, 50]]; // correct AB
  const steps: DPStep[] = [];
  for (let trial = 0; trial < 3; trial++) {
    const r = [Math.round(Math.random()), Math.round(Math.random())];
    // Compute Br
    const Br = [B[0][0] * r[0] + B[0][1] * r[1], B[1][0] * r[0] + B[1][1] * r[1]];
    steps.push({ table: [r[0], r[1], Br[0], Br[1]], current: [2], is2D: false });
    // Compute ABr
    const ABr = [A[0][0] * Br[0] + A[0][1] * Br[1], A[1][0] * Br[0] + A[1][1] * Br[1]];
    steps.push({ table: [r[0], r[1], Br[0], Br[1], ABr[0], ABr[1]], current: [4], is2D: false });
    // Compute Cr
    const Cr = [C[0][0] * r[0] + C[0][1] * r[1], C[1][0] * r[0] + C[1][1] * r[1]];
    steps.push({ table: [ABr[0], ABr[1], Cr[0], Cr[1], ABr[0] === Cr[0] ? 1 : 0, ABr[1] === Cr[1] ? 1 : 0], current: [4], is2D: false });
  }
  return steps;
}

function getSteps(name: string): DPStep[] {
  if (name.includes("Fibonacci")) return fibSteps(15);
  if (name.includes("Catalan")) return catalanSteps(10);
  if (name.includes("Factorial")) return factorialSteps(10);
  if (name.includes("Pascal")) return pascalSteps(8);
  if (name.includes("Knapsack")) return knapsackSteps();
  if (name.includes("Longest Common Sub")) return lcsSteps();
  if (name.includes("Longest Increasing")) return lisSteps();
  if (name.includes("Edit Distance") || name.includes("Levenshtein")) return editDistSteps();
  if (name.includes("Longest Palindromic")) return lpsSteps();
  if (name.includes("Integer Partition")) return intPartSteps(12);
  if (name.includes("Shortest Common")) return scsSteps();
  if (name.includes("Ugly")) return uglySteps(20);
  if (name.includes("Floyd-Warshall")) return floydWarshallSteps();
  if (name.includes("Maximum Sum Path")) return maxSumPathSteps();
  if (name.includes("Miller-Rabin")) return millerRabinSteps();
  if (name.includes("Freivalds")) return freivaldsSteps();
  return fibSteps(15);
}

export function DPTableViz({ isPlaying, speed, algorithmName }: Props) {
  const stepsRef = useRef<DPStep[]>(getSteps(algorithmName));
  const stepRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const [currentStep, setCurrentStep] = useState<DPStep | null>(null);

  useEffect(() => {
    stepsRef.current = getSteps(algorithmName);
    reset();
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying && stepsRef.current.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= stepsRef.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setCurrentStep(stepsRef.current[stepRef.current]);
        stepRef.current++;
      }, Math.max(50, 600 - speed * 55));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    setCurrentStep(null);
    stepRef.current = 0;
  };

  if (!currentStep) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-xs text-muted-foreground">{algorithmName} — Press Play to fill table</div>
      </div>
    );
  }

  if (currentStep.is2D) {
    const table = currentStep.table as number[][];
    const [cr, cc] = currentStep.current;
    const labels = currentStep.labels;
    const maxRows = Math.min(table.length, 12);
    const maxCols = Math.min(table[0]?.length || 0, 12);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 overflow-auto">
        <div className="text-xs text-muted-foreground mb-1">{algorithmName} — 2D Table</div>
        <div className="overflow-auto max-h-[280px]">
          <table className="border-collapse">
            {labels?.cols && (
              <thead>
                <tr>
                  <th className="w-8 h-6"></th>
                  {labels.cols.slice(0, maxCols).map((c, j) => (
                    <th key={j} className="w-8 h-6 text-[9px] text-muted-foreground font-mono">{c}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {table.slice(0, maxRows).map((row, i) => (
                <tr key={i}>
                  {labels?.rows && <td className="w-8 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                  {row.slice(0, maxCols).map((val, j) => (
                    <td
                      key={j}
                      className="w-8 h-8 text-center text-[10px] font-mono transition-all duration-100"
                      style={{
                        background: i === cr && j === cc
                          ? "hsl(145, 60%, 45%)"
                          : (i < cr || (i === cr && j < (cc ?? 0)))
                          ? "hsl(150, 20%, 15%)"
                          : "hsl(150, 15%, 10%)",
                        color: i === cr && j === cc ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                        border: `1px solid ${i === cr && j === cc ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 20%)"}`,
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
      </div>
    );
  }

  // 1D table (also handles Pascal's triangle which comes as 2D array in steps)
  const table = currentStep.table as number[];
  const [cur] = currentStep.current;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="text-xs text-muted-foreground mb-2">{algorithmName} — Step-by-step</div>
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {table.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{i}</span>
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg text-xs font-mono font-semibold transition-all duration-200"
              style={{
                background: i === cur ? "hsl(145, 60%, 45%)" : i < cur ? "hsl(150, 20%, 15%)" : "hsl(150, 15%, 10%)",
                color: i === cur ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                border: `1px solid ${i === cur ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 20%)"}`,
                boxShadow: i === cur ? "0 0 12px hsl(145, 60%, 45%, 0.3)" : "none",
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
    </div>
  );
}
