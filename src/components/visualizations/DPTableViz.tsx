import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
}

type DPStep = {
  table: number[] | number[][];
  current: [number, number?];
  is2D: boolean;
  labels?: { rows?: string[]; cols?: string[] };
  /** Cumulative LogTracer lines (e.g. Catalan Number) */
  dpLogs?: string[];
  /** Floyd-Warshall: graph + matrix snapshot + log */
  floydWarshall?: {
    dist: number[][];
    k: number;
    i: number;
    j: number;
    logs: string[];
  };
  /** 0/1 Knapsack: static item arrays + capacity (for Values/Weights panels). */
  knapsack?: {
    values: number[];
    weights: number[];
    capacity: number;
  };
};

/** D[0]=D[1]=1, D[i]=D[i-1]+D[i-2]; indices 0..lastIndex match algorithm-visualizer "Sequence". */
function fibSteps(lastIndex: number): DPStep[] {
  const dp = [1, 1];
  const logs: string[] = [];
  const steps: DPStep[] = [];

  const push = (idx: number, line: string) => {
    logs.push(line);
    steps.push({
      table: [...dp],
      current: [idx],
      is2D: false,
      dpLogs: [...logs],
    });
  };

  push(0, "F(0) = 1 — base case.");
  push(1, "F(1) = 1 — base case.");
  for (let i = 2; i <= lastIndex; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    const line =
      i < lastIndex
        ? `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`
        : `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} — sequence complete.`;
    push(i, line);
  }
  return steps;
}

function catalanOrdinal(k: number): string {
  const j = k % 10;
  const kk = k % 100;
  if (j === 1 && kk !== 11) return `${k}st`;
  if (j === 2 && kk !== 12) return `${k}nd`;
  if (j === 3 && kk !== 13) return `${k}rd`;
  return `${k}th`;
}

/** LSD-style DP: A[i] += A[j]*A[i-j-1]; one step per inner (i,j) — algorithm-visualizer style. */
function catalanSteps(n: number): DPStep[] {
  const dp = Array(n + 1).fill(0);
  const logs: string[] = [];
  const steps: DPStep[] = [];

  const push = (idx: number, line?: string) => {
    if (line) logs.push(line);
    steps.push({
      table: [...dp],
      current: [idx],
      is2D: false,
      dpLogs: [...logs],
    });
  };

  logs.push(`N = ${n}`);
  push(0, `initialize A[0..${n}] = 0`);
  dp[0] = 1;
  push(0, `A[0] = 1`);
  dp[1] = 1;
  push(1, `A[1] = 1`);

  for (let i = 2; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      const add = dp[j] * dp[i - 1 - j];
      dp[i] += add;
      push(i, `i=${i}, j=${j}: A[${i}] += A[${j}]×A[${i - 1 - j}] → ${dp[i]}`);
    }
  }

  logs.push(`The ${catalanOrdinal(n)} Catalan Number is ${dp[n]}`);
  steps.push({
    table: [...dp],
    current: [n],
    is2D: false,
    dpLogs: [...logs],
  });

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

/** Algorithm-visualizer demo: val = [1,4,5,7], wt = [1,3,4,5], W = 7 → opt 9. */
function knapsackSteps(): DPStep[] {
  const weights = [1, 3, 4, 5];
  const values = [1, 4, 5, 7];
  const W = 7;
  const n = weights.length;
  const rowLabels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const colLabels = Array.from({ length: W + 1 }, (_, j) => String(j));
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const logs: string[] = [];
  const steps: DPStep[] = [];
  const meta = { values, weights, capacity: W };

  const push = (i: number, w: number) => {
    steps.push({
      table: dp.map((r) => [...r]),
      current: [i, w],
      is2D: true,
      labels: { rows: rowLabels, cols: colLabels },
      knapsack: meta,
      dpLogs: [...logs],
    });
  };

  logs.push(`0/1 Knapsack: W=${W}, values=[${values.join(", ")}], weights=[${weights.join(", ")}].`);
  push(0, 0);

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (weights[i - 1] <= w) {
        const take = values[i - 1] + dp[i - 1][w - weights[i - 1]];
        const skip = dp[i - 1][w];
        dp[i][w] = Math.max(take, skip);
        logs.push(
          `i=${i}, w=${w}: max(take ${values[i - 1]}+dp[${i - 1}][${w - weights[i - 1]}]=${take}, skip dp[${i - 1}][${w}]=${skip}) → ${dp[i][w]}`,
        );
      } else {
        dp[i][w] = dp[i - 1][w];
        logs.push(`i=${i}, w=${w}: weight ${weights[i - 1]}>w → dp[${i}][${w}]=dp[${i - 1}][${w}]=${dp[i][w]}`);
      }
      push(i, w);
    }
  }

  logs.push(`Best value we can achieve is ${dp[n][W]}.`);
  push(n, W);

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

/** Unordered partitions of n (parts ≥1), for LogTracer lines (display sorted ascending). */
function integerPartitionsOf(n: number): number[][] {
  const res: number[][] = [];
  const buf: number[] = [];
  function dfs(rem: number, maxPart: number) {
    if (rem === 0) {
      res.push([...buf]);
      return;
    }
    for (let p = Math.min(maxPart, rem); p >= 1; p--) {
      buf.push(p);
      dfs(rem - p, p);
      buf.pop();
    }
  }
  dfs(n, n);
  return res;
}

/**
 * Algorithm-visualizer style: D[i][j] = ways to partition j using parts 1..i.
 * i,j are 0..n; inner loops i=1..n, j=1..n.
 */
function intPartSteps(n: number): DPStep[] {
  const D: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  D[0][0] = 1;
  for (let j = 1; j <= n; j++) D[0][j] = 0;
  for (let i = 1; i <= n; i++) D[i][0] = 1;

  const labels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const logs: string[] = [];
  const steps: DPStep[] = [];

  const push = (i: number, j: number) => {
    steps.push({
      table: D.map((r) => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: labels, cols: labels },
      dpLogs: [...logs],
    });
  };

  logs.push(`N = ${n}`);
  logs.push("Base: D[0][0]=1; D[i][0]=1; D[0][j]=0 for j>0.");
  push(0, 0);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      if (i > j) {
        D[i][j] = D[i - 1][j];
        logs.push(`i>${j}: D[${i}][${j}] = D[${i - 1}][${j}] = ${D[i][j]}`);
      } else {
        const above = D[i - 1][j];
        const left = D[i][j - i];
        D[i][j] = above + left;
        logs.push(
          `D[${i}][${j}] = D[${i - 1}][${j}] + D[${i}][${j - i}] = ${above} + ${left} = ${D[i][j]}`,
        );
      }
      push(i, j);
    }
  }

  const count = D[n][n];
  logs.push(`D[${n}][${n}] = ${count} — listing partitions (ascending parts):`);
  push(n, n);

  const parts = integerPartitionsOf(n);
  for (const p of parts) {
    const asc = [...p].sort((a, b) => a - b);
    logs.push(`[${asc.join(", ")}]`);
    push(n, n);
  }

  logs.push(String(count));
  push(n, n);

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

const FLOYD_INF = 999;

const FLOYD_NODES = [
  { id: 0, x: 200, y: 48 },
  { id: 1, x: 312, y: 118 },
  { id: 2, x: 268, y: 248 },
  { id: 3, x: 132, y: 248 },
  { id: 4, x: 88, y: 118 },
];

const FLOYD_EDGES: { from: number; to: number; w: number }[] = [
  { from: 0, to: 1, w: 3 },
  { from: 0, to: 3, w: 7 },
  { from: 1, to: 0, w: 8 },
  { from: 1, to: 2, w: 2 },
  { from: 2, to: 0, w: 5 },
  { from: 2, to: 3, w: 1 },
  { from: 3, to: 0, w: 2 },
  { from: 3, to: 4, w: 4 },
  { from: 4, to: 0, w: 2 },
  { from: 4, to: 2, w: 6 },
];

function fmtFloydDist(d: number): string {
  return d >= FLOYD_INF / 2 ? "∞" : String(d);
}

function floydWarshallSteps(): DPStep[] {
  const V = 5;
  const dist: number[][] = [
    [0, 3, FLOYD_INF, 7, FLOYD_INF],
    [8, 0, 2, FLOYD_INF, FLOYD_INF],
    [5, FLOYD_INF, 0, 1, FLOYD_INF],
    [2, FLOYD_INF, FLOYD_INF, 0, 4],
    [2, FLOYD_INF, 6, FLOYD_INF, 0],
  ];
  const logs: string[] = [];
  const steps: DPStep[] = [];

  const pushStep = (k: number, i: number, j: number) => {
    steps.push({
      table: [],
      current: [Math.max(0, i), Math.max(0, j)],
      is2D: false,
      floydWarshall: {
        dist: dist.map((row) => [...row]),
        k,
        i,
        j,
        logs: [...logs],
      },
    });
  };

  logs.push("Floyd-Warshall: all-pairs shortest paths on 5 vertices.");
  logs.push("Initialize d[i][j] with edge weights; missing edges = ∞.");
  pushStep(-1, -1, -1);

  for (let k = 0; k < V; k++) {
    logs.push(`Use vertex ${k} as intermediate (relax all pairs).`);
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (i !== j && dist[i][k] < FLOYD_INF && dist[k][j] < FLOYD_INF) {
          const nd = dist[i][k] + dist[k][j];
          if (nd < dist[i][j]) {
            dist[i][j] = nd;
            logs.push(
              `Relax (${i},${j}) via ${k}: d[${i}][${k}]+d[${k}][${j}] = ${dist[i][k]}+${dist[k][j]} → ${nd}`,
            );
          }
        }
        pushStep(k, i, j);
      }
    }
  }

  for (let a = 0; a < V; a++) {
    for (let b = 0; b < V; b++) {
      if (a !== b && dist[a][b] < FLOYD_INF) {
        logs.push(`The shortest path from ${a} to ${b} is ${dist[a][b]}.`);
      }
    }
  }
  pushStep(V, -1, -1);

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
  if (name.includes("Fibonacci")) return fibSteps(14);
  if (name.includes("Catalan")) return catalanSteps(10);
  if (name.includes("Factorial")) return factorialSteps(10);
  if (name.includes("Pascal")) return pascalSteps(8);
  if (name.includes("Knapsack")) return knapsackSteps();
  if (name.includes("Longest Common Sub")) return lcsSteps();
  if (name.includes("Longest Increasing")) return lisSteps();
  if (name.includes("Edit Distance") || name.includes("Levenshtein")) return editDistSteps();
  if (name.includes("Longest Palindromic")) return lpsSteps();
  if (name.includes("Integer Partition")) return intPartSteps(13);
  if (name.includes("Shortest Common")) return scsSteps();
  if (name.includes("Ugly")) return uglySteps(20);
  if (name.includes("Floyd-Warshall")) return floydWarshallSteps();
  if (name.includes("Maximum Sum Path")) return maxSumPathSteps();
  if (name.includes("Miller-Rabin")) return millerRabinSteps();
  if (name.includes("Freivalds")) return freivaldsSteps();
  return fibSteps(14);
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
    const idleHint = algorithmName.includes("Floyd-Warshall")
      ? "Press Play for graph + log trace"
      : algorithmName.includes("Integer Partition")
        ? "Press Play for 2D table + log trace"
        : algorithmName.includes("Knapsack")
          ? "Press Play for table, items + log"
          : "Press Play to fill table";
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-xs text-muted-foreground">{algorithmName} — {idleHint}</div>
      </div>
    );
  }

  const fw = currentStep.floydWarshall;
  if (fw) {
    const { dist, k, i, j, logs } = fw;
    const nodeRadius = 22;
    const labelForNode = (nid: number) =>
      i >= 0 ? fmtFloydDist(dist[i][nid]) : fmtFloydDist(dist[0][nid]);

    const edgeGeom = (from: (typeof FLOYD_NODES)[0], to: (typeof FLOYD_NODES)[0]) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const inset = nodeRadius + 5;
      const x1 = from.x + ux * inset;
      const y1 = from.y + uy * inset;
      const x2 = to.x - ux * inset;
      const y2 = to.y - uy * inset;
      return {
        x1,
        y1,
        x2,
        y2,
        mx: (x1 + x2) / 2 + uy * 12,
        my: (y1 + y2) / 2 - ux * 12,
      };
    };

    const arrowMarkerId = "floyd-warshall-arrow";

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">GraphTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 flex justify-center items-center min-h-[200px]">
            <svg viewBox="0 0 400 296" className="w-full max-w-[400px] h-[220px]" aria-label="Floyd-Warshall graph">
              <defs>
                <marker
                  id={arrowMarkerId}
                  markerWidth="9"
                  markerHeight="9"
                  refX="8"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 9 4, 0 8" fill="hsl(150, 12%, 45%)" />
                </marker>
              </defs>
              {FLOYD_EDGES.map((e, ei) => {
                const a = FLOYD_NODES[e.from];
                const b = FLOYD_NODES[e.to];
                const p = edgeGeom(a, b);
                const wLabel = e.w >= FLOYD_INF / 2 ? "∞" : String(e.w);
                return (
                  <g key={`floyd-edge-${e.from}-${e.to}-${ei}`}>
                    <line
                      x1={p.x1}
                      y1={p.y1}
                      x2={p.x2}
                      y2={p.y2}
                      stroke="hsl(150, 12%, 38%)"
                      strokeWidth={1.5}
                      markerEnd={`url(#${arrowMarkerId})`}
                    />
                    <text
                      x={p.mx}
                      y={p.my}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(150, 20%, 72%)"
                      fontSize={11}
                      fontFamily="ui-monospace, monospace"
                    >
                      {wLabel}
                    </text>
                  </g>
                );
              })}
              {FLOYD_NODES.map((n) => {
                const hlK = k >= 0 && k < 5 && n.id === k;
                const hlI = i >= 0 && n.id === i;
                const hlJ = j >= 0 && n.id === j;
                let ring = "hsl(150, 10%, 28%)";
                if (hlK && hlI && hlJ) ring = "hsl(280, 65%, 58%)";
                else if (hlK) ring = "hsl(45, 92%, 52%)";
                else if (hlI) ring = "hsl(224, 85%, 55%)";
                else if (hlJ) ring = "hsl(145, 60%, 45%)";
                const thick = hlK || hlI || hlJ ? 3 : 1.5;
                return (
                  <g key={`floyd-node-${n.id}`}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={nodeRadius}
                      fill="hsl(150, 12%, 14%)"
                      stroke={ring}
                      strokeWidth={thick}
                    />
                    <text
                      x={n.x}
                      y={n.y + 5}
                      textAnchor="middle"
                      fill="hsl(150, 20%, 92%)"
                      fontSize={14}
                      fontFamily="ui-monospace, monospace"
                      fontWeight={600}
                    >
                      {n.id}
                    </text>
                    <text
                      x={n.x + 30}
                      y={n.y + 4}
                      textAnchor="start"
                      fill="hsl(150, 20%, 65%)"
                      fontSize={11}
                      fontFamily="ui-monospace, monospace"
                    >
                      {labelForNode(n.id)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-xs font-mono text-foreground/90">
            {logs.length > 0 ? (
              logs.slice(-12).map((line, idx) => (
                <div key={`${idx}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to run Floyd-Warshall.</div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Reset
        </button>
      </div>
    );
  }

  if (currentStep.is2D) {
    const table = currentStep.table as number[][];
    const [cr, cc] = currentStep.current;
    const labels = currentStep.labels;
    const isIntPart = algorithmName.includes("Integer Partition") && currentStep.dpLogs;

    if (isIntPart) {
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      return (
        <div className="w-full h-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="text-[10px] text-muted-foreground mb-2">Array2DTracer</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-auto max-h-[min(220px,45vh)]">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-5 h-5 sm:w-6 sm:h-5" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-5 h-5 sm:w-6 text-[8px] sm:text-[9px] text-muted-foreground font-mono px-0.5">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && (
                        <td className="w-5 h-5 sm:w-6 text-[8px] sm:text-[9px] text-muted-foreground font-mono text-center pr-0.5">
                          {labels.rows[i]}
                        </td>
                      )}
                      {row.slice(0, maxCols).map((val, j) => (
                        <td
                          key={j}
                          className="w-5 h-5 sm:w-6 text-center text-[8px] sm:text-[9px] font-mono transition-all duration-100 px-0.5"
                          style={{
                            background:
                              i === cr && j === cc
                                ? "hsl(145, 60%, 45%)"
                                : i < cr || (i === cr && j < (cc ?? 0))
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
          </div>

          <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? (
                logLines.slice(-14).map((line, index) => (
                  <div key={`${index}-${line.slice(0, 40)}`}>{line}</div>
                ))
              ) : (
                <div>Press play to build the partition table.</div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            Reset
          </button>
        </div>
      );
    }

    const isKnapsack = algorithmName.includes("Knapsack") && currentStep.knapsack;
    if (isKnapsack) {
      const ks = currentStep.knapsack!;
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      const activeItem = cr > 0 ? cr - 1 : -1;
      const hiBg = "hsl(224, 85%, 48%)";
      const hiBorder = "hsl(224, 85%, 62%)";
      const pendingBg = "hsl(150, 12%, 12%)";

      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          <div className="shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Knapsack Table</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto max-h-[min(200px,38vh)]">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th
                          key={j}
                          className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && (
                        <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">
                          {labels.rows[i]}
                        </td>
                      )}
                      {row.slice(0, maxCols).map((val, j) => (
                        <td
                          key={j}
                          className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                          style={{
                            background:
                              i === cr && j === cc
                                ? "hsl(145, 60%, 45%)"
                                : i < cr || (i === cr && j < (cc ?? 0))
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
          </div>

          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Values</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-min mx-auto">
                <div className="flex justify-center gap-1">
                  {ks.values.map((_, idx) => (
                    <div
                      key={`kv-idx-${idx}`}
                      className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono"
                    >
                      {idx}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {ks.values.map((v, idx) => (
                    <div
                      key={`kv-val-${idx}`}
                      className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                      style={{
                        background: idx === activeItem ? hiBg : pendingBg,
                        borderColor: idx === activeItem ? hiBorder : "hsl(150, 10%, 26%)",
                        color: idx === activeItem ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                        boxShadow: idx === activeItem ? "0 0 0 1px hsl(224, 85%, 55%)" : undefined,
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Weights</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-min mx-auto">
                <div className="flex justify-center gap-1">
                  {ks.weights.map((_, idx) => (
                    <div
                      key={`kw-idx-${idx}`}
                      className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono"
                    >
                      {idx}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {ks.weights.map((wgt, idx) => (
                    <div
                      key={`kw-w-${idx}`}
                      className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                      style={{
                        background: idx === activeItem ? hiBg : pendingBg,
                        borderColor: idx === activeItem ? hiBorder : "hsl(150, 10%, 26%)",
                        color: idx === activeItem ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                        boxShadow: idx === activeItem ? "0 0 0 1px hsl(224, 85%, 55%)" : undefined,
                      }}
                    >
                      {wgt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-20 max-h-36 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? (
                logLines.slice(-12).map((line, index) => (
                  <div key={`${index}-${line.slice(0, 40)}`}>{line}</div>
                ))
              ) : (
                <div>Press play to run the knapsack DP.</div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            Reset
          </button>
        </div>
      );
    }

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
  const logLines = currentStep.dpLogs ?? [];
  const isFibonacci = algorithmName.includes("Fibonacci");
  const isCatalan = algorithmName.includes("Catalan");

  if (isFibonacci) {
    const minW = Math.max(table.length * 28, 160);
    const hiBg = "hsl(224, 85%, 48%)";
    const hiBorder = "hsl(224, 85%, 62%)";
    const doneBg = "hsl(150, 18%, 18%)";
    const pendingBg = "hsl(150, 12%, 12%)";
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Sequence</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex flex-col gap-1 min-w-min mx-auto" style={{ minWidth: `${minW}px` }}>
              <div className="flex justify-center gap-1">
                {table.map((_, i) => (
                  <div key={`fib-idx-${i}`} className="w-7 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {table.map((val, i) => (
                  <div
                    key={`fib-cell-${i}`}
                    className="w-7 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                    style={{
                      background: i === cur ? hiBg : i < cur ? doneBg : pendingBg,
                      borderColor: i === cur ? hiBorder : "hsl(150, 10%, 26%)",
                      color: i === cur ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                      boxShadow: i === cur ? "0 0 0 1px hsl(224, 85%, 55%)" : undefined,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-12).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to compute the Fibonacci sequence.</div>
            )}
          </div>
        </div>

        <button
          onClick={reset}
          className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Reset
        </button>
      </div>
    );
  }

  if (isCatalan) {
    const minW = Math.max(table.length * 28, 160);
    const hiBg = "hsl(224, 85%, 48%)";
    const hiBorder = "hsl(224, 85%, 62%)";
    const doneBg = "hsl(150, 18%, 18%)";
    const pendingBg = "hsl(150, 12%, 12%)";
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Catalan Numbers</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex flex-col gap-1 min-w-min mx-auto" style={{ minWidth: `${minW}px` }}>
              <div className="flex justify-center gap-1">
                {table.map((_, i) => (
                  <div key={`cat-idx-${i}`} className="w-7 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {table.map((val, i) => (
                  <div
                    key={`cat-cell-${i}`}
                    className="w-7 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                    style={{
                      background: i === cur ? hiBg : i < cur ? doneBg : pendingBg,
                      borderColor: i === cur ? hiBorder : "hsl(150, 10%, 26%)",
                      color: i === cur ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                      boxShadow: i === cur ? "0 0 0 1px hsl(224, 85%, 55%)" : undefined,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-12).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to run Catalan Number.</div>
            )}
          </div>
        </div>

        <button
          onClick={reset}
          className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Reset Array
        </button>
      </div>
    );
  }

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
