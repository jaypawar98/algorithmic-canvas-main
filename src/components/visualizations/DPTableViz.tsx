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
  /** LCS: string arrays, highlight logic for both strings */
  lcs?: {
    str1: string[];
    str2: string[];
    hl1: number[];
    hl2: number[];
  };
  /** LPS: string array, highlight logic for string */
  lps?: {
    str: string[];
    hl1: number[];
    hl2: number[];
  };
  /** Max Sum Path: original grid */
  maxSumPath?: {
    grid: number[][];
  };
  /** Pascal's Triangle */
  pascal?: boolean;
  /** Shortest Common Supersequence */
  scs?: {
    str1: string[];
    str2: string[];
  };
  /** Sieve of Eratosthenes */
  sieve?: {
    marks: boolean[];
    p: number;
    c: number;
  };
  slidingWindow?: {
    l: number;
    r: number;
    max: number;
  };
  /** Ugly Numbers mapping */
  ugly?: {
    M: [number, number, number];
    I: [number, number, number];
  };
  zSearch?: {
    text: string[];
    pattern: string[];
    concat: string[];
    zArray: number[];
    l: number;
    r: number;
  };
  majorityVote?: {
    A: number[];
    candidate: number | null;
  };
  jobScheduling?: {
    schedule: string[];
    jobIds: string[];
    deadlines: number[];
    profits: number[];
    activeIdx?: number;
    activeSlot?: number;
  };
  stableMatching?: {
    A: string[];
    B: string[];
    activeA?: string;
    activeB?: string;
    stableA: string[];
    stableB: string[];
  };
  cellularAutomata?: {
    grid: string[][];
    generation: number;
    currI: number;
    currJ: number;
  };
  euclidean?: {
    A: number[];
    activeIdx?: number;
  };
  suffixArray?: {
    SA: (string | number)[][];
    givenWord: string[];
  };
  affine?: {
    encrypt: string[];
    decrypt: string[];
    activeEncryptIdx?: number;
    activeDecryptIdx?: number;
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
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: DPStep[] = [];
  const indices = Array.from({ length: n }, (_, i) => String(i));
  
  const pushStep = (i: number, j: number) => {
    steps.push({
      table: dp.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: indices, cols: indices },
      pascal: true
    });
  };

  pushStep(-1, -1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (j === i || j === 0) {
        dp[i][j] = 1;
      } else {
        dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
      }
      pushStep(i, j);
    }
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
  const a = "AGGTAB";
  const b = "GXTXAYB";
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (i: number, j: number, hl1: number[] = [], hl2: number[] = []) => {
    steps.push({
      table: dp.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: ["*", ...a.split("")], cols: ["*", ...b.split("")] },
      dpLogs: [...logs],
      lcs: { str1: a.split(""), str2: b.split(""), hl1, hl2 }
    });
  };

  pushStep(0, 0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
      pushStep(i, j);
    }
  }

  // Backtracking to find LCS
  let i = m, j = n;
  let lcsLength = dp[m][n];
  const lcsStr: string[] = [];
  const hl1: number[] = [];
  const hl2: number[] = [];
  
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcsStr.unshift(a[i - 1]);
      hl1.unshift(i - 1);
      hl2.unshift(j - 1);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  logs.push(`Longest Common Subsequence Length is ${lcsLength}`);
  logs.push(`Longest Common Subsequence is ${lcsStr.join("")}`);
  pushStep(-1, -1, hl1, hl2);

  return steps;
}

function lisSteps(): DPStep[] {
  const A = [2, 5, 7, 7, 3, 9, 3, 4, 0, 3];
  const LIS = Array(A.length).fill(1);
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (i: number, j?: number) => {
    steps.push({
      table: [...A],
      current: j !== undefined ? [i, j] : [i],
      is2D: false,
      dpLogs: [...logs]
    });
  };

  logs.push("Calculating Longest Increasing Subsequence values in bottom up manner");
  pushStep(0);
  
  for (let i = 1; i < A.length; i++) {
    logs.push(`LIS[${i}] = ${LIS[i]}`);
    pushStep(i);
    for (let j = 0; j < i; j++) {
      if (A[i] > A[j] && LIS[i] < LIS[j] + 1) {
        LIS[i] = LIS[j] + 1;
        logs.push(`LIS[${i}] = ${LIS[i]}`);
      }
      pushStep(i, j);
    }
  }

  let max = LIS[0];
  for (let i = 1; i < A.length; i++) {
    if (LIS[i] > max) max = LIS[i];
  }
  logs.push(`Pick maximum of all LIS values`);
  logs.push(`Max LIS length is ${max}`);
  pushStep(-1, -1);

  return steps;
}

function editDistSteps(): DPStep[] {
  const a = "stack";
  const b = "racket";
  const m = a.length, n = b.length;
  // Initialize with -1
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(-1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  const logs: string[] = [];
  const steps: DPStep[] = [];
  const labelsRows = ["*", ...a.split("")];
  const labelsCols = ["*", ...b.split("")];

  const pushStep = (i: number, j: number) => {
    steps.push({
      table: dp.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: labelsRows, cols: labelsCols },
      dpLogs: [...logs],
    });
  };

  const logGrid = () => {
    logs.push(`   ${labelsCols.join(" ")}`);
    for (let r = 0; r <= m; r++) {
      logs.push(`${labelsRows[r]}  ${dp[r].join(",")}`);
    }
  };

  logs.push("Initialized DP table");
  logs.push(`Y-Axis (Top to Bottom): ${a}`);
  logs.push(`X-Axis (Left to Right): ${b}`);
  logGrid();
  pushStep(0, 0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        logs.push(`Matched '${a[i - 1]}', cost 0: table[${i}][${j}] = table[${i - 1}][${j - 1}] = ${dp[i][j]}`);
      } else {
        // Substitution, deletion, insertion
        const sub = dp[i - 1][j - 1];
        const del = dp[i - 1][j];
        const ins = dp[i][j - 1];
        dp[i][j] = Math.min(sub, del, ins) + 1;
        logs.push(`Mismatch '${a[i - 1]}' vs '${b[j - 1]}', cost 1: table[${i}][${j}] = min(${del}, ${ins}, ${sub}) + 1 = ${dp[i][j]}`);
      }
      pushStep(i, j);
    }
  }

  logs.push(`Final edit distance: ${dp[m][n]}`);
  pushStep(m, n);

  return steps;
}

function lpsSteps(): DPStep[] {
  const s = "BBABCBCAB";
  const str = s.split("");
  const n = s.length;
  // Initialize with empty strings or nulls to match typical visualizer styles,
  // or just use 0's but we only show the upper triangle.
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const logs: string[] = [];
  const steps: DPStep[] = [];
  const indices = Array.from({ length: n }, (_, i) => String(i));
  
  const pushStep = (i: number, j: number, hl1: number[] = []) => {
    steps.push({
      table: dp.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: indices, cols: indices },
      dpLogs: [...logs],
      lps: { str, hl1, hl2: [] }
    });
  };

  logs.push(`LPS for any string with length = 1 is 1`);
  logs.push(`---------------------------------------------`);
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }
  pushStep(-1, -1);

  for (let len = 2; len <= n; len++) {
    logs.push(`Considering a sub-string of length ${len}`);
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      pushStep(i, j, [i, j]);
      if (s[i] === s[j]) {
        dp[i][j] = len === 2 ? 2 : dp[i + 1][j - 1] + 2;
        logs.push(`Characters match. table[${i}][${j}] = ${dp[i][j]}`);
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        logs.push(`No match. table[${i}][${j}] = max(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`);
      }
      pushStep(i, j, [i, j]);
    }
  }
  
  logs.push(`Maximum LPS length is ${dp[0][n - 1]}`);
  pushStep(0, n - 1, [0, n - 1]);

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
  
  const logs: string[] = [];
  const steps: DPStep[] = [];
  const labelsX = Array.from({ length: n + 1 }, (_, j) => String(j));
  const labelsY = Array.from({ length: m + 1 }, (_, i) => String(i));
  
  const pushStep = (i: number, j: number) => {
    steps.push({
      table: dp.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: labelsY, cols: labelsX },
      dpLogs: [...logs],
      scs: { str1: a.split(""), str2: b.split("") }
    });
  };

  pushStep(-1, -1);
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
        logs.push(`DP[0][${j}] = ${j}`);
      } else if (j === 0) {
        dp[i][j] = i;
        if (i > 0) logs.push(`DP[${i}][0] = ${i}`);
      } else {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          logs.push(`a[${i-1}] == b[${j-1}], DP[${i}][${j}] = DP[${i-1}][${j-1}] + 1 = ${dp[i][j]}`);
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;
          logs.push(`DP[${i}][${j}] = 1 + min(DP[${i-1}][${j}], DP[${i}][${j-1}]) = ${dp[i][j]}`);
        }
      }
      pushStep(i, j);
    }
  }
  logs.push(`Shortest Common Supersequence is ${dp[m][n]}`);
  pushStep(m, n);
  
  return steps;
}

function uglySteps(n: number): DPStep[] {
  const dp = [1];
  let i2 = 0, i3 = 0, i5 = 0;
  let m2 = 2, m3 = 3, m5 = 5;
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (idx: number) => {
    steps.push({
      table: [...dp],
      current: [idx],
      is2D: false,
      dpLogs: [...logs],
      ugly: {
        M: [m2, m3, m5],
        I: [i2, i3, i5]
      }
    });
  };

  pushStep(0);

  for (let i = 1; i < n; i++) {
    const next = Math.min(m2, m3, m5);
    logs.push(`Minimum of ${m2}, ${m3}, ${m5} : ${next}`);
    dp.push(next);
    
    // We update M to keep UI synchronized immediately if selected 
    if (next === m2) { i2++; m2 = dp[i2] * 2; }
    if (next === m3) { i3++; m3 = dp[i3] * 3; }
    if (next === m5) { i5++; m5 = dp[i5] * 5; }
    
    pushStep(i);
  }
  return steps;
}

function sieveSteps(n: number): DPStep[] {
  const marks = Array(n + 1).fill(false);
  marks[1] = true;
  const table = Array.from({ length: n }, (_, i) => i + 1);
  const logs: string[] = [];
  const steps: DPStep[] = [];

  const pushStep = (p: number, c: number) => {
    steps.push({
      table: [...table],
      current: [c > 0 ? c - 1 : p > 0 ? p - 1 : -1],
      is2D: false,
      dpLogs: [...logs],
      sieve: { marks: [...marks], p, c }
    });
  };

  logs.push(`Initialize a boolean array of size ${n + 1} with false.`);
  pushStep(-1, -1);

  for (let p = 2; p <= n; p++) {
    if (!marks[p]) {
      logs.push(`${p} is not marked, so it is prime`);
      pushStep(p, -1);
      
      for (let i = p + p; i <= n; i += p) {
        marks[i] = true;
        logs.push(`${i} is a multiple of ${p} so it is marked as composite`);
        pushStep(p, i);
      }
    }
  }

  logs.push(`The unmarked numbers are the prime numbers from 1 to ${n}`);
  pushStep(-1, -1);
  return steps;
}

function zSearchSteps(): DPStep[] {
  const pattern = "abc";
  const text = "xabcabzabc";
  const concatStr = pattern + "$" + text;
  const N = concatStr.length;
  const z = Array(N).fill(0);
  
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (idx: number, lPos: number, rPos: number) => {
    steps.push({
      table: [],
      current: [idx],
      is2D: false,
      dpLogs: [...logs],
      zSearch: {
        text: text.split(''),
        pattern: pattern.split(''),
        concat: concatStr.split(''),
        zArray: [...z],
        l: lPos,
        r: rPos
      }
    });
  };

  let left = 0, right = 0;
  pushStep(0, 0, 0);

  for (let i = 1; i < N; i++) {
    if (i > right) {
      left = right = i;
      while (right < N && concatStr[right] === concatStr[right - left]) {
        right++;
      }
      z[i] = right - left;
      right--;
    } else {
      let k = i - left;
      if (z[k] < right - i + 1) {
        z[i] = z[k];
      } else {
        left = i;
        while (right < N && concatStr[right] === concatStr[right - left]) {
          right++;
        }
        z[i] = right - left;
        right--;
      }
    }
    pushStep(i, left, Math.max(0, right));
    
    // Log matches
    if (z[i] === pattern.length) {
      logs.push(`----------------------------------------`);
      logs.push(`Pattern Found at index ${i - pattern.length - 1}`);
      logs.push(`----------------------------------------`);
      pushStep(i, left, Math.max(0, right)); // Snapshot with log
    }
  }

  return steps;
}

function boyerMooreMajoritySteps(): DPStep[] {
  const A = [1, 3, 3, 2, 1, 1, 1];
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (idx: number, candidate: number | null) => {
    steps.push({
      table: [],
      current: [idx],
      is2D: false,
      dpLogs: [...logs],
      majorityVote: {
        A: [...A],
        candidate: candidate
      }
    });
  };

  let candidate = A[0];
  let count = 1;

  pushStep(0, candidate);

  for (let i = 1; i < A.length; i++) {
    if (count === 0) {
      logs.push(`Wrong assumption in majority element`);
      candidate = A[i];
      count = 1;
      logs.push(`New assumed majority element! Count : 1`);
    } else if (candidate === A[i]) {
      count++;
      logs.push(`Same as assumed majority element! Count : ${count}`);
    } else {
      count--;
      logs.push(`Not same as assumed majority element! Count : ${count}`);
    }
    pushStep(i, candidate);
  }

  logs.push(`Finally assumed majority element ${candidate}`);
  logs.push(`------------------------------------------------`);
  pushStep(-1, candidate);

  logs.push(`Verify majority element ${candidate}`);
  let verifyCount = 0;
  for (let i = 0; i < A.length; i++) {
    if (A[i] === candidate) verifyCount++;
  }
  logs.push(`   Count of our assumed majority element ${verifyCount}`);
  
  if (verifyCount > Math.floor(A.length / 2)) {
    logs.push(`Our assumption was correct!`);
    logs.push(`Majority element is ${candidate}`);
  } else {
    logs.push(`Our assumption was wrong!`);
    logs.push(`No majority element found`);
  }
  pushStep(-1, candidate);

  return steps;
}

function jobSchedulingSteps(): DPStep[] {
  const N = 5;
  const sortedIds = ['a', 'c', 'd', 'b', 'e'];
  const sortedDeadlines = [2, 2, 1, 1, 3];
  const sortedProfits = [100, 27, 25, 19, 15];
  
  const schedule = Array(N).fill("-");
  const slot = Array(N).fill(-1);
  
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (actIdx?: number, actSlot?: number) => {
    steps.push({
      table: [],
      current: [-1],
      is2D: false,
      dpLogs: [...logs],
      jobScheduling: {
        schedule: [...schedule],
        jobIds: [...sortedIds],
        deadlines: [...sortedDeadlines],
        profits: [...sortedProfits],
        activeIdx: actIdx,
        activeSlot: actSlot
      }
    });
  };

  logs.push("Initialize schedule with empty slots '-'.");
  pushStep();

  for (let i = 0; i < N; i++) {
    logs.push(`Pick job ${sortedIds[i]} with profit ${sortedProfits[i]} and deadline ${sortedDeadlines[i]}`);
    pushStep(i);
    let scheduled = false;
    const limit = Math.min(N, sortedDeadlines[i]);
    for (let j = limit - 1; j >= 0; j--) {
      pushStep(i, j); // highlight slot j currently being checked
      if (slot[j] === -1) {
        slot[j] = i;
        schedule[j] = sortedIds[i];
        logs.push(`Scheduled job ${sortedIds[i]} at slot ${j}`);
        pushStep(i, j);
        scheduled = true;
        break;
      }
    }
    if (!scheduled) {
      logs.push(`Could not schedule job ${sortedIds[i]} (no available slots before deadline).`);
    }
  }

  logs.push("Job scheduling complete.");
  pushStep();
  return steps;
}

function stableMatchingSteps(): DPStep[] {
  const men = ['Flavio', 'Stephen', 'Albert', 'Jack'];
  const women = ['July', 'Valentine', 'Violet', 'Summer'];
  
  const mPref: Record<string, string[]> = {
    Flavio: ['Valentine', 'July', 'Summer', 'Violet'],
    Stephen: ['Summer', 'July', 'Valentine', 'Violet'],
    Albert: ['July', 'Violet', 'Valentine', 'Summer'],
    Jack: ['July', 'Violet', 'Valentine', 'Summer']
  };
  
  const wPref: Record<string, string[]> = {
    July: ['Jack', 'Stephen', 'Albert', 'Flavio'],
    Valentine: ['Flavio', 'Jack', 'Stephen', 'Albert'],
    Violet: ['Jack', 'Stephen', 'Flavio', 'Albert'],
    Summer: ['Stephen', 'Flavio', 'Albert', 'Jack']
  };

  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  let freeMen = [...men];
  const wPartner: Record<string, string | null> = {};
  women.forEach(w => wPartner[w] = null);
  
  const mStable = new Set<string>();
  const wStable = new Set<string>();
  
  const pushStep = (activeM?: string, activeW?: string) => {
    steps.push({
      table: [],
      current: [-1],
      is2D: false,
      dpLogs: [...logs],
      stableMatching: {
        A: [...men],
        B: [...women],
        activeA: activeM,
        activeB: activeW,
        stableA: [...mStable],
        stableB: [...wStable]
      }
    });
  };

  pushStep();

  const mCount: Record<string, number> = {};
  men.forEach(m => mCount[m] = 0);

  while (freeMen.length > 0) {
    const m = freeMen[0];
    logs.push(`Selecting ${m}`);
    pushStep(m);
    
    if (mCount[m] >= 4) {
      freeMen.shift();
      continue;
    }
    
    const w = mPref[m][mCount[m]];
    mCount[m]++;
    logs.push(`--> Choicing ${w}`);
    pushStep(m, w);
    
    const currPartner = wPartner[w];
    if (currPartner === null) {
      wPartner[w] = m;
      freeMen.shift();
      mStable.add(m);
      wStable.add(w);
      logs.push(`--> ${w} is not stable, stabilizing with ${m}`);
      pushStep(m, w);
    } else {
      const wPrefList = wPref[w];
      const mIdx = wPrefList.indexOf(m);
      const currIdx = wPrefList.indexOf(currPartner);
      
      if (mIdx < currIdx) {
        wPartner[w] = m;
        freeMen.shift();
        mStable.add(m);
        freeMen.push(currPartner);
        mStable.delete(currPartner);
        logs.push(`--> ${w} is more stable with ${m} rather than ${currPartner} - stabilizing again`);
        pushStep(m, w);
      } else {
        logs.push(`--> ${w} rejected ${m}`);
        pushStep(m, w);
      }
    }
  }

  logs.push("Stable matching complete.");
  pushStep();
  return steps;
}

function cellularAutomataSteps(): DPStep[] {
  const steps: DPStep[] = [];
  const N = 10;
  const fillShape = '#';
  const emptyShape = '.';
  const generations = 3;
  
  const grid: string[][] = Array(N).fill(0).map(() => Array(N).fill(emptyShape));
  
  // Predictable pseudo-random initialization
  const seeds = [1, 5, 8, 12, 17, 23, 29, 36, 42, 55, 61, 74, 88, 93];
  let seedIdx = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i === 0 || j === 0 || i === N - 1 || j === N - 1) {
        grid[i][j] = fillShape;
      } else {
        const r = (seeds[seedIdx % seeds.length] * 17 + i * 31 + j * 47) % 100;
        seedIdx++;
        if (r < 40) grid[i][j] = fillShape;
      }
    }
  }

  const pushStep = (g: string[][], gen: number, currI: number, currJ: number) => {
    steps.push({
      table: [], current: [-1], is2D: false, dpLogs: [],
      cellularAutomata: { grid: g.map(row => [...row]), generation: gen, currI, currJ }
    });
  };

  pushStep(grid, 0, -1, -1);

  let currentGrid = grid.map(row => [...row]);
  
  for (let iter = 0; iter < generations; iter++) {
    let nextGrid = currentGrid.map(row => [...row]);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let adjCount = 0;
        let twoAwayCount = 0;
        for (let x = -2; x <= 2; x++) {
          for (let y = -2; y <= 2; y++) {
            if (!(x === 0 && y === 0)) {
              const ni = i + x;
              const nj = j + y;
              let isFill = false;
              if (ni >= 0 && ni < N && nj >= 0 && nj < N) {
                isFill = (currentGrid[ni][nj] === fillShape);
              } else {
                isFill = true; // out of bounds counts as fill
              }
              if (isFill) {
                if (x === -2 || x === 2 || y === -2 || y === 2) twoAwayCount++;
                else adjCount++;
              }
            }
          }
        }
        
        if (adjCount >= 5) {
          nextGrid[i][j] = fillShape;
        } else if (adjCount <= 1) {
          if (twoAwayCount < 3) nextGrid[i][j] = fillShape;
          else nextGrid[i][j] = emptyShape;
        } else {
          nextGrid[i][j] = emptyShape;
        }
        
        // Push intermediate steps moderately to not overload
        if (i % 3 === 0 && j === 0) pushStep(nextGrid, iter + 1, i, j);
      }
    }
    currentGrid = nextGrid;
    pushStep(currentGrid, iter + 1, -1, -1);
  }

  return steps;
}

function euclideanGCDSteps(): DPStep[] {
  const steps: DPStep[] = [];
  const logs: string[] = [];
  const a = [465, 255];
  
  const pushStep = (actIdx?: number) => {
    steps.push({
      table: [],
      current: [-1],
      is2D: false,
      dpLogs: [...logs],
      euclidean: {
        A: [...a],
        activeIdx: actIdx
      }
    });
  };

  pushStep();

  if (a[0] > a[1]) {
    const tmp = a[0];
    a[0] = a[1];
    a[1] = tmp;
    pushStep();
  }

  while (a[0] > 0) {
    logs.push(`${a[1]} % ${a[0]} = ${a[1] % a[0]}`);
    pushStep(1);
    
    a[1] %= a[0];
    logs.push("Switching a[1] with a[1]%a[0]");
    pushStep(1);
    
    const tmp = a[0];
    a[0] = a[1];
    a[1] = tmp;
    logs.push("Now switching the two values to keep a[0] < a[1]");
    pushStep(); 
  }

  logs.push(`The greatest common divisor is ${a[1]}`);
  pushStep();
  return steps;
}

function suffixArraySteps(): DPStep[] {
  const steps: DPStep[] = [];
  const logs: string[] = [];
  const word = "virgo";
  const s = word + "$";
  const givenWordArr = word.split(""); // without $
  
  const arr: (string | number)[][] = [];
  for (let i = 1; i <= s.length; i++) {
     arr.push([i, '-']);
  }
  
  const pushStep = () => {
    steps.push({
      table: [], current: [-1], is2D: false, dpLogs: [...logs],
      suffixArray: { SA: arr.map(e => [...e]), givenWord: givenWordArr }
    });
  };

  logs.push("Appended '$' at the end of word as terminating (special) character. Beginning filling of suffixes");
  pushStep();
  
  for(let i = 0; i < s.length; i++){
     arr[i][1] = s.slice(i);
     pushStep();
  }
  
  logs.push("Re-organizing Suffix Array in sorted order of suffixes using efficient sorting algorithm (O(N.log(N)))");
  pushStep();
  
  const toSort = arr.map(e => [...e]);
  
  toSort.sort((a, b) => {
    const valA = a[1] as string;
    const valB = b[1] as string;
    const isGreater = valA > valB;
    logs.push(`The condition a [1] (${valA}) > b [1] (${valB}) is ${isGreater ? "true" : "false"}`);
    return valA.localeCompare(valB);
  });
  
  for(let i=0; i < toSort.length; i++){
    arr[i] = toSort[i];
    pushStep();
  }
  return steps;
}

function affineCipherSteps(): DPStep[] {
  const steps: DPStep[] = [];
  const logs: string[] = [];
  const plainText = 'secret';
  const N = 26;
  const keys = { a: 5, b: 7 };
  const a_inv = 21;
  const encrypt: string[] = [];
  const decrypt: string[] = [];

  const pushStep = (actEnc?: number, actDec?: number) => {
    steps.push({
      table: [], current: [-1], is2D: false, dpLogs: [...logs],
      affine: { encrypt: [...encrypt], decrypt: [...decrypt], activeEncryptIdx: actEnc, activeDecryptIdx: actDec }
    });
  };

  pushStep();
  
  logs.push("Beginning Affine Encryption");
  logs.push("Encryption formula: (keys.a * index + keys.b) % N");
  logs.push(`keys.a=${keys.a}, keys.b=${keys.b}, N=${N}`);
  pushStep();

  for (let i = 0; i < plainText.length; i++) {
    const alpha = plainText[i];
    const index = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    const result = ((keys.a * index) + keys.b) % N;
    logs.push(`Index of ${alpha} = ${index}`);
    encrypt.push(String.fromCharCode(result + 'a'.charCodeAt(0)));
    pushStep(i, undefined);
  }

  logs.push(" ");
  logs.push("Beginning Affine Decryption");
  logs.push("Decryption formula: (a^-1 * (index - keys.b)) % N");
  logs.push(`keys.b=${keys.b}, N=${N}`);
  pushStep(undefined, undefined);

  for (let i = 0; i < encrypt.length; i++) {
    const alpha = encrypt[i];
    const index = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    const base = index - keys.b;
    let result = (a_inv * base) % N;
    if (result < 0) result += N;
    logs.push(`Index of ${alpha} = ${index}`);
    decrypt.push(String.fromCharCode(result + 'a'.charCodeAt(0)));
    pushStep(undefined, i);
  }

  pushStep();
  return steps;
}

function slidingWindowSteps(): DPStep[] {
  const D = [4, 2, 4, -4, -1, -4, 2, 2, -4, 0, -4, 4, -3, -3, -4, 1, -3, 0, -1, 0];
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (l: number, r: number, maxVal: number) => {
    steps.push({
      table: [...D],
      current: [r],
      is2D: false,
      dpLogs: [...logs],
      slidingWindow: { l, r, max: maxVal }
    });
  };

  let sum = D[0] + D[1] + D[2];
  let max = sum;
  logs.push(`sum = ${sum}`);
  pushStep(0, 2, max); // Initially window is 0 to 2

  for (let i = 3; i < D.length; i++) {
    sum += D[i] - D[i - 3];
    logs.push(`sum = ${sum}`);
    if (max < sum) max = sum;
    pushStep(i - 2, i, max);
  }

  logs.push(`max = ${max}`);
  pushStep(D.length - 3, D.length - 1, max);

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
  const D = [
    [2, 1, 4, 5, 5],
    [2, 2, 4, 3, 2],
    [5, 3, 4, 4, 2],
    [3, 5, 3, 1, 2],
    [4, 2, 5, 1, 5]
  ];
  const N = 5;
  const M = 5;
  const DP: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
  
  const logs: string[] = [];
  const steps: DPStep[] = [];
  const labels = Array.from({ length: 5 }, (_, i) => String(i));
  
  const pushStep = (i: number, j: number) => {
    steps.push({
      table: DP.map(r => [...r]),
      current: [i, j],
      is2D: true,
      labels: { rows: labels, cols: labels },
      dpLogs: [...logs],
      maxSumPath: { grid: D }
    });
  };

  logs.push("Finding maximum sum path from top-left to bottom-right");
  pushStep(-1, -1);

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      if (i === 0 && j === 0) {
        DP[i][j] = D[i][j];
        logs.push(`DP[0][0] = ${D[i][j]}`);
      } else if (i === 0) {
        let prev = DP[i][j - 1];
        DP[i][j] = prev + D[i][j];
        logs.push(`i=0: DP[${i}][${j}] = DP[${i}][${j-1}] + D[${i}][${j}] = ${prev} + ${D[i][j]} = ${DP[i][j]}`);
      } else if (j === 0) {
        let prev = DP[i - 1][j];
        DP[i][j] = prev + D[i][j];
        logs.push(`j=0: DP[${i}][${j}] = DP[${i-1}][${j}] + D[${i}][${j}] = ${prev} + ${D[i][j]} = ${DP[i][j]}`);
      } else {
        let top = DP[i - 1][j];
        let left = DP[i][j - 1];
        let maxVal = Math.max(top, left);
        DP[i][j] = maxVal + D[i][j];
        logs.push(`DP[${i}][${j}] = max(DP[${i-1}][${j}], DP[${i}][${j-1}]) + D[${i}][${j}] = max(${top}, ${left}) + ${D[i][j]} = ${DP[i][j]}`);
      }
      pushStep(i, j);
    }
  }
  logs.push(`Maximum path sum is ${DP[N - 1][M - 1]}`);
  pushStep(N - 1, M - 1);
  return steps;
}

function maxSubarraySteps(): DPStep[] {
  const arr = [-2, -3, 4, -1, -2, 1, 5, -3];
  const logs: string[] = [];
  const steps: DPStep[] = [];
  
  const pushStep = (i: number) => {
    steps.push({
      table: [...arr],
      current: [i],
      is2D: false,
      dpLogs: [...logs]
    });
  };

  let maxSoFar = 0;
  let maxEndingHere = 0;

  for (let i = 0; i < arr.length; i++) {
    pushStep(i);
    logs.push(`${maxEndingHere} + ${arr[i]}`);
    maxEndingHere += arr[i];
    logs.push(`-> ${maxEndingHere}`);
    
    if (maxEndingHere < 0) {
      logs.push("maxEndingHere is negative, set to 0");
      maxEndingHere = 0;
    }

    if (maxSoFar < maxEndingHere) {
      logs.push(`maxSoFar < maxEndingHere, setting maxSoFar to maxEndingHere (${maxEndingHere})`);
      maxSoFar = maxEndingHere;
    }
    pushStep(i);
  }

  logs.push(`Maximum Subarray's Sum is: ${maxSoFar}`);
  pushStep(-1);

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
  if (name.includes("Factorial")) return factorialSteps(14);
  if (name.includes("Pascal")) return pascalSteps(9);
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
  if (name.includes("Maximum Subarray")) return maxSubarraySteps();
  if (name.includes("Miller-Rabin")) return millerRabinSteps();
  if (name.includes("Freivalds")) return freivaldsSteps();
  if (name.includes("Sieve")) return sieveSteps(30);
  if (name.includes("Sliding Window")) return slidingWindowSteps();
  if (name.includes("Ugly")) return uglySteps(15);
  if (name.includes("Z String")) return zSearchSteps();
  if (name.includes("Boyer")) return boyerMooreMajoritySteps();
  if (name.includes("Job Scheduling")) return jobSchedulingSteps();
  if (name.includes("Stable Matching")) return stableMatchingSteps();
  if (name.includes("Cellular Automata")) return cellularAutomataSteps();
  if (name.includes("Euclidean")) return euclideanGCDSteps();
  if (name.includes("Suffix Array")) return suffixArraySteps();
  if (name.includes("Affine")) return affineCipherSteps();
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
    const isEditDist = (algorithmName.includes("Edit") || algorithmName.includes("Levenshtein")) && currentStep.dpLogs;

    if (isIntPart || isEditDist) {
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      return (
        <div className="w-full h-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="text-[10px] text-muted-foreground mb-2">
              {isEditDist ? "Distance Table" : "Array2DTracer"}
            </div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-auto flex-1 h-full min-h-[200px]">
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
                <div>Press play to build the table.</div>
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
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
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

    const isLcs = algorithmName.includes("Longest Common Sub") && currentStep.lcs;
    if (isLcs) {
      const { str1, str2, hl1, hl2 } = currentStep.lcs!;
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      
      const hlBg = "hsl(224, 85%, 48%)";
      const hlBorder = "hsl(224, 85%, 62%)";
      const pendingBg = "hsl(150, 12%, 12%)";
      const borderNormal = "hsl(150, 10%, 26%)";
      const textNormal = "hsl(150, 20%, 88%)";
      const textHl = "hsl(210, 40%, 8%)";

      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          {/* String 1 Panel */}
          <div className="w-full shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">String 1</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-min mx-auto">
                <div className="flex justify-center gap-1">
                  {str1.map((_, idx) => (
                    <div key={`s1-idx-${idx}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">{idx}</div>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {str1.map((char, idx) => {
                    const isHl = hl1.includes(idx);
                    return (
                      <div
                        key={`s1-c-${idx}`}
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                        style={{
                          background: isHl ? hlBg : pendingBg,
                          borderColor: isHl ? hlBorder : borderNormal,
                          color: isHl ? textHl : textNormal,
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* String 2 Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">String 2</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-min mx-auto">
                <div className="flex justify-center gap-1">
                  {str2.map((_, idx) => (
                    <div key={`s2-idx-${idx}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">{idx}</div>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {str2.map((char, idx) => {
                    const isHl = hl2.includes(idx);
                    return (
                      <div
                        key={`s2-c-${idx}`}
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                        style={{
                          background: isHl ? hlBg : pendingBg,
                          borderColor: isHl ? hlBorder : borderNormal,
                          color: isHl ? textHl : textNormal,
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Memo Table Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Memo Table</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.slice(0, maxCols).map((val, j) => {
                        const isMatchCell = i > 0 && j > 0 && hl1.includes(i - 1) && hl2.includes(j - 1) && hl1.indexOf(i - 1) === hl2.indexOf(j - 1);
                        let cellBg = "hsl(150, 15%, 10%)";
                        let cellColor = "hsl(150, 20%, 70%)";
                        let cellBorder = "hsl(150, 15%, 20%)";

                        if (i === cr && j === cc) {
                          cellBg = "hsl(145, 60%, 45%)";
                          cellColor = "hsl(150, 30%, 4%)";
                          cellBorder = "hsl(145, 60%, 45%)";
                        } else if (isMatchCell) {
                          cellBg = hlBg;
                          cellColor = textHl;
                          cellBorder = hlBorder;
                        } else if (i < cr || (i === cr && j < (cc ?? 0))) {
                          cellBg = "hsl(150, 20%, 15%)";
                        }

                        return (
                          <td
                            key={j}
                            className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                            style={{
                              background: cellBg,
                              color: cellColor,
                              border: `1px solid ${cellBorder}`
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LogTracer Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-20 max-h-36 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? (
                logLines.slice(-12).map((line, index) => (
                  <div key={`${index}-${line.slice(0, 40)}`}>{line}</div>
                ))
              ) : (
                <div>Press play to construct the memo table and find LCS.</div>
              )}
            </div>
          </div>

          <button onClick={reset} className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
        </div>
      );
    }

    const isLps = algorithmName.includes("Longest Palindromic") && currentStep.lps;
    if (isLps) {
      const { str, hl1 } = currentStep.lps!;
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      
      const hlBg = "hsl(224, 85%, 48%)";
      const hlBorder = "hsl(224, 85%, 62%)";
      const pendingBg = "hsl(150, 12%, 12%)";
      const borderNormal = "hsl(150, 10%, 26%)";
      const textNormal = "hsl(150, 20%, 88%)";
      const textHl = "hsl(210, 40%, 8%)";

      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          {/* Input Text Panel */}
          <div className="w-full shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Input Text</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-min mx-auto">
                <div className="flex justify-center gap-1">
                  {str.map((_, idx) => (
                    <div key={`s-idx-${idx}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">{idx}</div>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {str.map((char, idx) => {
                    const isHl = hl1.includes(idx);
                    return (
                      <div
                        key={`s-c-${idx}`}
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                        style={{
                          background: isHl ? hlBg : pendingBg,
                          borderColor: isHl ? hlBorder : borderNormal,
                          color: isHl ? textHl : textNormal,
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Matrix</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.slice(0, maxCols).map((val, j) => {
                        const isMatchCell = hl1.includes(i) && hl1.includes(j);
                        let cellBg = "hsl(150, 15%, 10%)";
                        let cellColor = "hsl(150, 20%, 70%)";
                        let cellBorder = "hsl(150, 15%, 20%)";

                        let displayVal: string | number = val;

                        if (i > j) {
                          cellBg = "transparent";
                          cellBorder = "transparent";
                          displayVal = "";
                        } else if (i === cr && j === cc) {
                          cellBg = "hsl(145, 60%, 45%)";
                          cellColor = "hsl(150, 30%, 4%)";
                          cellBorder = "hsl(145, 60%, 45%)";
                        } else if (isMatchCell && i !== j) {
                          cellBg = hlBg;
                          cellColor = textHl;
                          cellBorder = hlBorder;
                        }

                        if (i <= j && displayVal === 0) displayVal = "";

                        return (
                          <td
                            key={j}
                            className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                            style={{
                              background: cellBg,
                              color: cellColor,
                              border: i > j ? "none" : `1px solid ${cellBorder}`
                            }}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LogTracer Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-20 max-h-36 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? (
                logLines.slice(-12).map((line, index) => (
                  <div key={`${index}-${line.slice(0, 40)}`}>{line}</div>
                ))
              ) : (
                <div>Press play to construct the matrix and find LPS.</div>
              )}
            </div>
          </div>

          <button onClick={reset} className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
        </div>
      );
    }

    const isMaxSumPath = algorithmName.includes("Maximum Sum Path") && currentStep.maxSumPath;
    if (isMaxSumPath) {
      const { grid } = currentStep.maxSumPath!;
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      
      const hlBg = "hsl(145, 60%, 45%)";
      const hlBorder = "hsl(145, 60%, 45%)";
      const pendingBg = "hsl(150, 15%, 10%)";
      const doneBg = "hsl(150, 20%, 15%)";
      const borderNormal = "hsl(150, 15%, 20%)";
      
      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          {/* Array2DTracer Panel */}
          <div className="w-full shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Array2DTracer</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {grid.map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.map((val, j) => {
                        const isActive = i === cr && j === cc;
                        const isDone = i < cr || (i === cr && j < cc!);
                        
                        return (
                          <td
                            key={j}
                            className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                            style={{
                              background: isActive ? hlBg : isDone ? doneBg : "hsl(150, 15%, 10%)",
                              color: isActive ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                              border: `1px solid ${isActive ? hlBorder : borderNormal}`
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Table Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Results Table</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.slice(0, maxCols).map((val, j) => {
                        const isActive = i === cr && j === cc;
                        const isDone = i < cr || (i === cr && j < cc!);
                        
                        return (
                          <td
                            key={j}
                            className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                            style={{
                              background: isActive ? hlBg : isDone ? doneBg : pendingBg,
                              color: isActive ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                              border: `1px solid ${isActive ? hlBorder : borderNormal}`
                            }}
                          >
                            {val === 0 && !isDone && !isActive ? "" : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LogTracer Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-20 max-h-36 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? (
                logLines.slice(-12).map((line, index) => (
                  <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
                ))
              ) : (
                <div>Press play to calculate maximum sum path.</div>
              )}
            </div>
          </div>

          <button onClick={reset} className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
        </div>
      );
    }

    const isScs = algorithmName.includes("Shortest Common") && currentStep.scs;
    if (isScs) {
      const { str1, str2 } = currentStep.scs!;
      const logLines = currentStep.dpLogs ?? [];
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      const hlBg = "hsl(145, 60%, 45%)";
      const pendingBg = "hsl(150, 15%, 10%)";
      const doneBg = "hsl(150, 20%, 15%)";
      
      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          {/* String 1 Panel */}
          <div className="w-full shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">String 1</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <div className="flex justify-center flex-col items-center">
                <div className="flex gap-1">
                  {str1.map((_, idx) => <div key={idx} className="w-8 text-[9px] text-center text-muted-foreground font-mono">{idx}</div>)}
                </div>
                <div className="flex gap-1 mt-1">
                  {str1.map((char, idx) => {
                    const isActive = cr > 0 && idx === cr - 1;
                    return (
                      <div key={idx} className="w-8 h-8 flex items-center justify-center border font-mono text-[10px] transition-colors" style={{ background: isActive ? hlBg : pendingBg, borderColor: isActive ? hlBg : "hsl(150, 15%, 20%)", color: isActive ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)" }}>{char}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* String 2 Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">String 2</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <div className="flex justify-center flex-col items-center">
                <div className="flex gap-1">
                  {str2.map((_, idx) => <div key={idx} className="w-8 text-[9px] text-center text-muted-foreground font-mono">{idx}</div>)}
                </div>
                <div className="flex gap-1 mt-1">
                  {str2.map((char, idx) => {
                    const isActive = cc > 0 && idx === cc - 1;
                    return (
                      <div key={idx} className="w-8 h-8 flex items-center justify-center border font-mono text-[10px] transition-colors" style={{ background: isActive ? hlBg : pendingBg, borderColor: isActive ? hlBg : "hsl(150, 15%, 20%)", color: isActive ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)" }}>{char}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Memo Table Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Memo Table</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.slice(0, maxCols).map((val, j) => {
                        const isActive = i === cr && j === cc;
                        const isDone = i < cr || (i === cr && j < cc!);
                        return (
                          <td key={j} className="w-6 h-6 text-center text-[9px] font-mono border transition-colors" style={{ background: isActive ? hlBg : isDone ? doneBg : pendingBg, borderColor: isActive ? hlBg : "hsl(150, 15%, 20%)", color: "hsl(150, 20%, 80%)" }}>
                            {val === 0 && !isDone && !isActive ? "" : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LogTracer Panel */}
          <div className="w-full border-t border-border/20 pt-3 mt-3 shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
            <div className="min-h-20 max-h-36 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
              {logLines.length > 0 ? logLines.slice(-12).map((line, index) => <div key={`${index}-${line.slice(0,40)}`}>{line}</div>) : <div>Press play to calculate sequence.</div>}
            </div>
          </div>
          <button onClick={reset} className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
        </div>
      );
    }

    const isPascal = algorithmName.includes("Pascal") && currentStep.pascal;
    if (isPascal) {
      const maxRows = table.length;
      const maxCols = table[0]?.length ?? 0;
      const hlBg = "hsl(145, 60%, 45%)";
      const hlBorder = "hsl(145, 60%, 45%)";
      const doneBg = "hsl(150, 20%, 15%)";
      const pendingBg = "hsl(150, 15%, 10%)";
      const borderNormal = "hsl(150, 15%, 20%)";

      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-auto">
          <div className="w-full shrink-0">
            <div className="text-[10px] text-muted-foreground mb-2">Pascal's Triangle</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-2 overflow-x-auto">
              <table className="border-collapse mx-auto">
                {labels?.cols && (
                  <thead>
                    <tr>
                      <th className="w-6 h-6" />
                      {labels.cols.slice(0, maxCols).map((c, j) => (
                        <th key={j} className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(0, maxRows).map((row, i) => (
                    <tr key={i}>
                      {labels?.rows && <td className="w-6 h-6 text-[9px] text-muted-foreground font-mono text-center">{labels.rows[i]}</td>}
                      {row.slice(0, maxCols).map((val, j) => {
                        const isActive = i === cr && j === cc;
                        const isDone = i < cr || (i === cr && j < cc!);
                        
                        return (
                          <td
                            key={j}
                            className="w-7 h-7 text-center text-[10px] font-mono transition-all duration-100"
                            style={{
                              background: isActive ? hlBg : isDone ? doneBg : pendingBg,
                              color: isActive ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                              border: `1px solid ${isActive ? hlBorder : borderNormal}`
                            }}
                          >
                            {j > i ? "" : val === 0 && !isActive ? "" : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button onClick={reset} className="mx-auto mt-3 mb-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">Reset</button>
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

  const isArrayTrace = (algorithmName.includes("Longest Increasing") || algorithmName.includes("Maximum Subarray") || algorithmName.includes("Sliding Window")) && currentStep.dpLogs;
  if (isArrayTrace) {
    const isSliding = algorithmName.includes("Sliding");
    const sw = currentStep.slidingWindow;
    const [iPos, jPos] = currentStep.current;
    
    // Exact mimic of Array1DTracer from visualizer
    const minW = Math.max(table.length * 32, 160);
    const hiBg = "hsl(224, 76%, 48%)"; // blue for active/window
    const jBg = "hsl(145, 60%, 45%)";  // green for j
    const pendingBg = "hsl(215, 10%, 18%)"; 
    const borderDark = "hsl(215, 10%, 26%)"; // border separating cells

    return (
      <div className="w-full h-full flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 overflow-x-auto min-h-[min(200px,38vh)] flex items-start pt-6">
            <div className="flex flex-col min-w-min" style={{ minWidth: `${minW}px` }}>
              <div className="flex justify-start mb-1">
                {table.map((_, i) => (
                  <div key={`arr-idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-start">
                {table.map((val, i) => {
                  let isI = false;
                  let isJ = false;
                  
                  if (isSliding && sw) {
                    isI = i >= sw.l && i <= sw.r;
                  } else {
                    isI = i === iPos;
                    isJ = i === jPos;
                  }

                  let cellBg = pendingBg;
                  let color = "hsl(150, 20%, 88%)";

                  if (isI) {
                    cellBg = hiBg;
                    color = "white";
                  } else if (isJ) {
                    cellBg = jBg;
                    color = "white";
                  }

                  return (
                    <div
                      key={`arr-cell-${i}`}
                      className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors"
                      style={{
                        background: cellBg,
                        color,
                        borderTop: `1px solid ${borderDark}`,
                        borderBottom: `1px solid ${borderDark}`,
                        borderLeft: `1px solid ${borderDark}`,
                        borderRight: i === table.length - 1 ? `1px solid ${borderDark}` : 'none'
                      }}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-12).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to start {algorithmName}.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isSieve = algorithmName.includes("Sieve") && currentStep.sieve;
  if (isSieve) {
    const { marks, p, c } = currentStep.sieve!;
    const minW = Math.max(table.length * 36, 160);
    const hlBg = "hsl(145, 60%, 45%)"; // prime color green-ish
    const activeBg = "hsl(45, 92%, 52%)"; // current operating multiple
    const compBg = "hsl(224, 76%, 48%)"; // algorithm-visualizer solid blue
    const pendingBg = "hsl(215, 15%, 15%)"; // dark grey for unvisited/prime

    return (
      <div className="w-full h-full flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Sieve</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 overflow-x-auto min-h-[min(200px,38vh)] flex items-start pt-6">
            <div className="flex flex-col gap-1 min-w-min" style={{ minWidth: `${minW}px` }}>
              <div className="flex justify-start gap-[2px]">
                {table.map((_, i) => (
                  <div key={`sieve-idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-start gap-[2px]">
                {table.map((val, i) => {
                  const num = val;
                  const isMarked = marks[num];
                  const isCurrentPrime = num === p;
                  const isCurrentMultiple = num === c;
                  
                  let cellBg = pendingBg;
                  let color = "hsl(150, 20%, 88%)";

                  if (isCurrentMultiple) {
                    cellBg = activeBg;
                    color = "hsl(210, 40%, 8%)";
                  } else if (isCurrentPrime) {
                    cellBg = hlBg;
                    color = "hsl(210, 40%, 8%)";
                  } else if (isMarked) {
                    cellBg = compBg;
                    color = "white";
                  }

                  return (
                    <div
                      key={`sieve-cell-${i}`}
                      className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors rounded-[2px]"
                      style={{
                        background: cellBg,
                        color,
                      }}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-12).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to start Sieve of Eratosthenes.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isUgly = algorithmName.includes("Ugly") && currentStep.ugly;
  if (isUgly) {
    const { M, I } = currentStep.ugly!;
    const hiBg = "hsl(145, 60%, 45%)"; // prime color green-ish
    const pendingBg = "hsl(215, 15%, 15%)"; 
    const borderDark = "hsl(215, 10%, 26%)";

    const renderArray = (arr: (number|string)[], label: string, activeIdx?: number) => (
      <div className="w-full shrink-0 border-t border-border/20 pt-3">
        <div className="text-[10px] text-muted-foreground mb-2">{label}</div>
        <div className="flex items-center min-h-[50px] sm:min-h-[100px] justify-center overflow-x-auto">
          <div className="flex flex-col min-w-min">
            <div className="flex justify-start mb-1">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              {arr.map((val, i) => (
                <div
                  key={`cell-${i}`}
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors"
                  style={{
                    background: i === activeIdx ? hiBg : pendingBg,
                    color: i === activeIdx ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                    borderTop: `1px solid ${borderDark}`,
                    borderBottom: `1px solid ${borderDark}`,
                    borderLeft: `1px solid ${borderDark}`,
                    borderRight: i === arr.length - 1 ? `1px solid ${borderDark}` : 'none'
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderArray(table, "Ugly Numbers", cur)}
          
          <div className="mt-2">
            {renderArray(M, "Multiples of 2, 3, 5")}
          </div>
          
          <div className="mt-2">
            {renderArray(I, "Iterators I0, I1, I2")}
          </div>

        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-14).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to generate ugly numbers.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isZSearch = algorithmName.includes("Z String") && currentStep.zSearch;
  if (isZSearch) {
    const { text, pattern, concat, zArray, l, r } = currentStep.zSearch!;
    const activeBg = "hsl(145, 60%, 45%)"; // active index highlight
    const lBg = "hsl(45, 92%, 52%)"; // left bound highlight
    const rBg = "hsl(224, 76%, 48%)"; // right bound highlight
    const pendingBg = "hsl(215, 15%, 15%)";
    const borderDark = "hsl(215, 10%, 26%)";

    const renderArray = (arr: (string|number)[], label: string, highlightLogic: (idx: number) => string | undefined) => (
      <div className="w-full shrink-0 border-t border-border/20 pt-3">
        <div className="text-[10px] text-muted-foreground mb-2">{label}</div>
        <div className="flex items-center justify-start overflow-x-auto">
          <div className="flex flex-col min-w-min mx-auto">
            <div className="flex justify-start mb-1">
              {arr.map((_, i) => (
                <div key={`z-idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              {arr.map((val, i) => {
                const bgOverride = highlightLogic(i);
                return (
                  <div
                    key={`z-cell-${i}`}
                    className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors"
                    style={{
                      background: bgOverride || pendingBg,
                      color: bgOverride ? "hsl(210, 40%, 8%)" : "hsl(150, 20%, 88%)",
                      borderTop: `1px solid ${borderDark}`,
                      borderBottom: `1px solid ${borderDark}`,
                      borderLeft: `1px solid ${borderDark}`,
                      borderRight: i === arr.length - 1 ? `1px solid ${borderDark}` : 'none'
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderArray(text, "text", () => undefined)}
          <div className="mt-2">{renderArray(pattern, "pattern", () => undefined)}</div>
          <div className="mt-2">
            {renderArray(concat, "concatenated string", (i) => {
              if (i === cur) return activeBg;
              if (cur > 0 && i >= l && i <= r) return rBg; // highlight matched block within z-box
              return undefined;
            })}
          </div>
          <div className="mt-2">
            {renderArray(zArray, "zArray", (i) => i === cur ? activeBg : undefined)}
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-14).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to calculate Z-array.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isMajorityVote = algorithmName.includes("Boyer") && currentStep.majorityVote;
  if (isMajorityVote) {
    const { A, candidate } = currentStep.majorityVote!;
    // algorithm-visualizer majority vote pink highlight
    const pinkBg = "hsl(330, 80%, 45%)";
    const pendingBg = "hsl(215, 10%, 18%)";
    const borderDark = "hsl(215, 10%, 26%)";
    const minW = Math.max(A.length * 32, 160);

    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="w-full shrink-0 border-t border-border/20 pt-3">
            <div className="text-[10px] text-muted-foreground mb-4">List of element</div>
            <div className="flex items-center min-h-[min(200px,38vh)] justify-center overflow-x-auto">
              <div className="flex flex-col min-w-min mx-auto" style={{ minWidth: `${minW}px` }}>
                <div className="flex justify-start mb-1">
                  {A.map((_, i) => (
                    <div key={`bm-idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  {A.map((val, i) => {
                    const isCandidate = val === candidate;
                    return (
                      <div
                        key={`bm-cell-${i}`}
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors"
                        style={{
                          background: isCandidate ? pinkBg : pendingBg,
                          color: isCandidate ? "white" : "hsl(150, 20%, 88%)",
                          borderTop: `1px solid ${borderDark}`,
                          borderBottom: `1px solid ${borderDark}`,
                          borderLeft: `1px solid ${borderDark}`,
                          borderRight: i === A.length - 1 ? `1px solid ${borderDark}` : 'none'
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">Console</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90 leading-tight">
            {logLines.length > 0 ? (
              logLines.map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`} className="whitespace-pre">{line}</div>
              ))
            ) : (
              <div>Press play to calculate majority element.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isJobScheduling = algorithmName.includes("Job Scheduling") && currentStep.jobScheduling;
  if (isJobScheduling) {
    const { schedule, jobIds, deadlines, profits, activeIdx, activeSlot } = currentStep.jobScheduling!;
    const activeBg = "hsl(145, 60%, 45%)"; // checking slot (green or active element)
    const slotBg = "hsl(224, 76%, 48%)"; // blue for schedule checking
    const pendingBg = "hsl(215, 15%, 15%)";
    const borderDark = "hsl(215, 10%, 26%)";

    const renderArray = (arr: (string|number)[], label: string, highlightLogic: (idx: number) => string | undefined) => (
      <div className="w-full shrink-0 border-t border-border/20 pt-3">
        <div className="text-[10px] text-muted-foreground mb-2">{label}</div>
        <div className="flex items-center min-h-[50px] sm:min-h-[100px] justify-center overflow-x-auto">
          <div className="flex flex-col min-w-min mx-auto">
            <div className="flex justify-start mb-1">
              {arr.map((_, i) => (
                <div key={`js-idx-${i}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              {arr.map((val, i) => {
                const bgOverride = highlightLogic(i);
                return (
                  <div
                    key={`js-cell-${i}`}
                    className="w-8 h-8 shrink-0 flex items-center justify-center text-[11px] font-mono font-semibold transition-colors"
                    style={{
                      background: bgOverride || pendingBg,
                      color: bgOverride ? "white" : "hsl(150, 20%, 88%)",
                      borderTop: `1px solid ${borderDark}`,
                      borderBottom: `1px solid ${borderDark}`,
                      borderLeft: `1px solid ${borderDark}`,
                      borderRight: i === arr.length - 1 ? `1px solid ${borderDark}` : 'none'
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderArray(schedule, "Schedule", (i) => i === activeSlot ? slotBg : undefined)}
          <div className="mt-2">{renderArray(jobIds, "Job Ids", (i) => i === activeIdx ? activeBg : undefined)}</div>
          <div className="mt-2">{renderArray(deadlines, "Deadlines", (i) => i === activeIdx ? activeBg : undefined)}</div>
          <div className="mt-2">{renderArray(profits, "Profit", (i) => i === activeIdx ? activeBg : undefined)}</div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 max-h-40 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-3 text-[11px] sm:text-xs font-mono text-foreground/90">
            {logLines.length > 0 ? (
              logLines.slice(-14).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`}>{line}</div>
              ))
            ) : (
              <div>Press play to schedule jobs.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isStableMatching = algorithmName.includes("Stable Matching") && currentStep.stableMatching;
  if (isStableMatching) {
    const { A, B, activeA, activeB, stableA, stableB } = currentStep.stableMatching!;
    const activeBg = "hsl(145, 60%, 45%)"; // green highlight
    const stableBg = "hsl(224, 76%, 48%)"; // blue for matched
    const pendingBg = "hsl(215, 10%, 18%)";
    const borderDark = "hsl(215, 10%, 26%)";

    const renderStableArray = (arr: string[], label: string, activeId?: string, stableArr?: string[]) => (
      <div className="w-full shrink-0 border-t border-border/20 pt-3 flex-1 flex flex-col justify-center">
        <div className="text-[10px] text-muted-foreground mb-4">{label}</div>
        <div className="flex items-center justify-center overflow-x-auto">
          <div className="flex flex-col min-w-min mx-auto">
            <div className="flex justify-start mb-1">
              {arr.map((_, i) => (
                <div key={`stm-idx-${label}-${i}`} className="flex-1 min-w-[3.5rem] px-2 shrink-0 text-center text-[9px] text-muted-foreground font-mono">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              {arr.map((val, i) => {
                const isActive = val === activeId;
                const isStable = stableArr?.includes(val);
                const bgOverride = isActive ? activeBg : (isStable ? stableBg : pendingBg);
                return (
                  <div
                    key={`stm-cell-${label}-${i}`}
                    className="flex-1 min-w-[3.5rem] h-8 px-2 shrink-0 flex items-center justify-center text-[11px] font-mono transition-colors"
                    style={{
                      background: bgOverride,
                      color: isActive || isStable ? "white" : "hsl(150, 20%, 88%)",
                      borderTop: `1px solid ${borderDark}`,
                      borderBottom: `1px solid ${borderDark}`,
                      borderLeft: `1px solid ${borderDark}`,
                      borderRight: i === arr.length - 1 ? `1px solid ${borderDark}` : 'none'
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderStableArray(A, "A", activeA, stableA)}
          {renderStableArray(B, "B", activeB, stableB)}
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">Console</div>
          <div className="min-h-32 max-h-48 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-4 text-[11px] sm:text-xs font-mono text-foreground/90 leading-relaxed">
            {logLines.length > 0 ? (
              logLines.map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`} className="whitespace-pre">{line}</div>
              ))
            ) : (
              <div>Press play to evaluate stable matching.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isCellular = algorithmName.includes("Cellular Automata") && currentStep.cellularAutomata;
  if (isCellular) {
    const { grid, generation, currI, currJ } = currentStep.cellularAutomata!;
    const pinkBg = "hsl(330, 80%, 45%)";
    const darkBg = "hsl(215, 12%, 18%)";
    const activeBg = "hsl(224, 76%, 48%)"; // blue for currently processing cell
    const borderDark = "hsl(215, 10%, 25%)";
    
    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="w-full shrink-0 border-t border-border/20 pt-3 flex-1 flex flex-col justify-center">
            <div className="text-[10px] text-muted-foreground mb-4">Array2DTracer</div>
            <div className="flex items-center justify-center overflow-x-auto">
              <div className="flex flex-col min-w-min mx-auto">
                <div className="flex justify-start mb-1 h-6">
                  <div className="w-6 shrink-0"></div>
                  {grid[0].map((_, idx) => (
                    <div key={`cal-h-${idx}`} className="w-7 shrink-0 text-center text-[10px] text-muted-foreground font-mono">
                      {idx}
                    </div>
                  ))}
                </div>
                {grid.map((row, i) => (
                  <div key={`cal-row-${i}`} className="flex justify-start items-center">
                    <div className="w-6 shrink-0 text-center text-[10px] text-muted-foreground font-mono">
                      {i}
                    </div>
                    <div className="flex">
                      {row.map((val, j) => {
                        const isActive = currI === i && currJ === j;
                        const isFill = val === '#';
                        return (
                          <div
                            key={`cal-col-${j}`}
                            className="w-7 h-7 shrink-0 flex items-center justify-center text-[11px] font-mono transition-colors"
                            style={{
                              background: isActive ? activeBg : (isFill ? pinkBg : darkBg),
                              color: isFill ? "white" : "hsl(150, 10%, 45%)",
                              borderTop: `1px solid ${borderDark}`,
                              borderBottom: i === grid.length - 1 ? `1px solid ${borderDark}` : 'none',
                              borderLeft: `1px solid ${borderDark}`,
                              borderRight: j === row.length - 1 ? `1px solid ${borderDark}` : 'none',
                            }}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-6 text-[11px] font-mono text-muted-foreground">
              Generation: {generation}
            </div>
          </div>
        </div>
        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isEuclidean = algorithmName.includes("Euclidean Greatest Common Divisor") && currentStep.euclidean;
  if (isEuclidean) {
    const { A, activeIdx } = currentStep.euclidean!;
    const activeBg = "hsl(224, 76%, 48%)";
    const pendingBg = "hsl(215, 12%, 18%)";
    const borderDark = "hsl(215, 10%, 25%)";
    
    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
          <div className="w-full shrink-0 border-t border-border/20 pt-10 flex-1 flex flex-col">
            <div className="text-[10px] text-muted-foreground mb-4 pl-4 sm:pl-8">Euclidean Algorithm</div>
            <div className="flex items-center justify-center mt-12 overflow-x-auto">
              <div className="flex flex-col mx-auto">
                <div className="flex justify-start mb-1 h-6">
                  {A.map((_, i) => (
                    <div key={`eu-idx-${i}`} className="w-16 shrink-0 text-center text-xs text-muted-foreground font-mono">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  {A.map((val, i) => {
                    const isActive = i === activeIdx;
                    return (
                      <div
                        key={`eu-val-${i}`}
                        className="w-16 h-12 flex shrink-0 items-center justify-center text-base font-mono transition-colors"
                        style={{
                          background: isActive ? activeBg : pendingBg,
                          color: isActive ? "white" : "hsl(150, 10%, 80%)",
                          borderTop: `1px solid ${borderDark}`,
                          borderBottom: `1px solid ${borderDark}`,
                          borderLeft: `1px solid ${borderDark}`,
                          borderRight: i === A.length - 1 ? `1px solid ${borderDark}` : 'none'
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-32 max-h-48 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-4 text-[11px] sm:text-xs font-mono text-foreground/90 leading-relaxed">
            {logLines.length > 0 ? (
              logLines.slice(-14).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`} className="whitespace-pre">{line}</div>
              ))
            ) : (
              <div>Press play to evaluate step by step.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isSuffixArray = algorithmName.includes("Suffix Array") && currentStep.suffixArray;
  if (isSuffixArray) {
    const { SA, givenWord } = currentStep.suffixArray!;
    const borderDark = "hsl(215, 10%, 26%)";
    const bgDark = "hsl(215, 12%, 18%)";
    
    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-start pt-6 gap-6">
          <div className="w-full shrink-0 border-t border-border/20 pt-3">
            <div className="text-[10px] text-muted-foreground mb-4 pl-4">Suffix Array</div>
            <div className="flex items-center justify-center overflow-x-auto">
              <div className="flex flex-col mx-auto">
                <div className="flex justify-start mb-1">
                  <div className="w-8 shrink-0 text-center text-[10px] text-muted-foreground"></div>
                  <div className="w-8 shrink-0 text-center text-[10px] text-muted-foreground">0</div>
                  <div className="w-16 shrink-0 text-center text-[10px] text-muted-foreground">1</div>
                </div>
                {SA.map((row, i) => (
                  <div key={`sa-row-${i}`} className="flex justify-start">
                    <div className="w-8 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">
                      {i}
                    </div>
                    {row.map((val, j) => (
                      <div
                        key={`sa-col-${i}-${j}`}
                        className={`${j === 0 ? "w-8" : "w-16"} h-7 flex shrink-0 items-center justify-center text-xs font-mono`}
                        style={{
                          background: bgDark,
                          color: "hsl(150, 20%, 88%)",
                          borderTop: `1px solid ${borderDark}`,
                          borderBottom: i === SA.length - 1 ? `1px solid ${borderDark}` : 'none',
                          borderLeft: `1px solid ${borderDark}`,
                          borderRight: j === row.length - 1 ? `1px solid ${borderDark}` : 'none'
                        }}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 border-t border-border/20 pt-3">
            <div className="text-[10px] text-muted-foreground mb-4 pl-4">Given Word</div>
            <div className="flex items-center justify-center overflow-x-auto">
              <div className="flex flex-col mx-auto">
                <div className="flex justify-start mb-1">
                  {givenWord.map((_, i) => (
                    <div key={`gw-idx-${i}`} className="w-8 shrink-0 text-center text-[10px] text-muted-foreground">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  {givenWord.map((char, i) => (
                    <div
                      key={`gw-char-${i}`}
                      className="w-8 h-8 flex shrink-0 items-center justify-center text-xs font-mono"
                      style={{
                        background: bgDark,
                        color: "hsl(150, 20%, 88%)",
                        borderTop: `1px solid ${borderDark}`,
                        borderBottom: `1px solid ${borderDark}`,
                        borderLeft: `1px solid ${borderDark}`,
                        borderRight: i === givenWord.length - 1 ? `1px solid ${borderDark}` : 'none'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">Progress</div>
          <div className="min-h-32 max-h-48 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-4 text-[11px] sm:text-xs font-mono text-foreground/90 leading-relaxed">
            {logLines.length > 0 ? (
              logLines.map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`} className="whitespace-pre">{line}</div>
              ))
            ) : (
              <div>Press play to construct array.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isAffine = algorithmName.includes("Affine Cipher") && currentStep.affine;
  if (isAffine) {
    const { encrypt, decrypt, activeEncryptIdx, activeDecryptIdx } = currentStep.affine!;
    const borderDark = "hsl(215, 10%, 25%)";
    const bgDark = "hsl(215, 12%, 18%)";
    const activeBg = "hsl(224, 76%, 48%)";
    
    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-start pt-6 gap-6">
          <div className="w-full shrink-0 border-t border-border/20 pt-3">
            <div className="text-[10px] text-muted-foreground mb-4 pl-4">Encryption</div>
            <div className="flex items-center justify-center mt-6 overflow-x-auto">
              <div className="flex flex-col mx-auto">
                <div className="flex justify-start mb-1 h-6">
                  {encrypt.length === 0 ? (
                    <div className="h-6 w-full" />
                  ) : encrypt.map((_, i) => (
                    <div key={`enc-idx-${i}`} className="w-12 shrink-0 text-center text-xs text-muted-foreground font-mono">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  {encrypt.map((char, i) => (
                    <div
                      key={`enc-char-${i}`}
                      className="w-12 h-10 flex shrink-0 items-center justify-center text-sm font-mono transition-colors"
                      style={{
                        background: i === activeEncryptIdx ? activeBg : bgDark,
                        color: i === activeEncryptIdx ? "white" : "hsl(150, 10%, 80%)",
                        borderTop: `1px solid ${borderDark}`,
                        borderBottom: `1px solid ${borderDark}`,
                        borderLeft: `1px solid ${borderDark}`,
                        borderRight: i === encrypt.length - 1 ? `1px solid ${borderDark}` : 'none'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 border-t border-border/20 pt-3">
            <div className="text-[10px] text-muted-foreground mb-4 pl-4">Decryption</div>
            <div className="flex items-center justify-center mt-6 overflow-x-auto">
              <div className="flex flex-col mx-auto">
                <div className="flex justify-start mb-1 h-6">
                  {decrypt.length === 0 ? (
                    <div className="h-6 w-full" />
                  ) : decrypt.map((_, i) => (
                    <div key={`dec-idx-${i}`} className="w-12 shrink-0 text-center text-xs text-muted-foreground font-mono">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  {decrypt.map((char, i) => (
                    <div
                      key={`dec-char-${i}`}
                      className="w-12 h-10 flex shrink-0 items-center justify-center text-sm font-mono transition-colors"
                      style={{
                        background: i === activeDecryptIdx ? activeBg : bgDark,
                        color: i === activeDecryptIdx ? "white" : "hsl(150, 10%, 80%)",
                        borderTop: `1px solid ${borderDark}`,
                        borderBottom: `1px solid ${borderDark}`,
                        borderLeft: `1px solid ${borderDark}`,
                        borderRight: i === decrypt.length - 1 ? `1px solid ${borderDark}` : 'none'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 border-t border-border/20 pt-3 shrink-0">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-32 max-h-48 overflow-y-auto rounded-md border border-border/20 bg-black/10 p-4 text-[11px] sm:text-xs font-mono text-foreground/90 leading-relaxed">
            {logLines.length > 0 ? (
              logLines.slice(-14).map((line, index) => (
                <div key={`${index}-${line.slice(0, 48)}`} className="whitespace-pre">{line.trim() === "" ? "\n" : line}</div>
              ))
            ) : (
              <div>Press play to begin affine mapping.</div>
            )}
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
        </button>
      </div>
    );
  }

  const isSequence = algorithmName.includes("Factorial");
  if (isSequence) {
    const minW = Math.max(table.length * 40, 160);
    const hiBg = "hsl(145, 60%, 45%)";
    const hiBorder = "hsl(145, 60%, 45%)";
    const pendingBg = "hsl(150, 15%, 10%)";

    return (
      <div className="w-full h-full flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Sequence</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto min-h-[min(200px,38vh)] flex items-center h-full">
            <div className="flex flex-col gap-1 min-w-min mx-auto" style={{ minWidth: `${minW}px` }}>
              <div className="flex justify-center gap-1">
                {table.map((_, i) => (
                  <div key={`seq-idx-${i}`} className="min-w-[32px] px-1 shrink-0 text-center text-[10px] text-muted-foreground font-mono">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {table.map((val, i) => {
                  const isCur = i === cur;
                  return (
                    <div
                      key={`seq-cell-${i}`}
                      className="min-w-[32px] px-1 h-8 shrink-0 flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors"
                      style={{
                        background: isCur ? hiBg : pendingBg,
                        borderColor: isCur ? hiBorder : "hsl(150, 15%, 20%)",
                        color: isCur ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 70%)",
                      }}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button onClick={reset} className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Reset
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
