import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
  onStep?: (step: number, total: number) => void;
  onCodeMarkerChange?: (marker: string | null) => void;
}

type Step = {
  arr: number[];
  comparing: number[];
  sorted: number[];
  pivot?: number;
  range?: [number, number];
  codeMarker?: string | null;
  log?: string;
  target?: number;
  /** Bucket Sort: deep copy per step (algorithm-visualizer style) */
  buckets?: number[][];
  /** Counting Sort: original input shown in Array row; cumulative / position counts; output buffer */
  countingCounts?: number[];
  countingSortedOut?: Array<number | null>;
  countsHighlightIdx?: number | null;
  sortedOutHighlightIdx?: number | null;
  /** Merge Sort: Array2DTracer (row0 = aux, row1 = main) + LogTracer */
  mergeRow0?: number[];
  mergeRow1?: number[];
  mergeHighlight0?: number | null;
  mergeHighlight1?: number | null;
  mergeLogs?: string[];
};

const bubbleDemoArray = [8, 3, 1, 1, 4, 8, 2, 3, 8, 3, 4, 3, 4, 8, 3];
const combDemoArray = [3, 4, 4, 1, 4, 6, 5, 8, 6, 8, 7, 9, 9, 8, 8];
const cycleDemoArray = [7, 1, 9, 4, 6, 6, 9, 5, 8, 3, 6, 6, 4, 4, 9];
const heapsortDemoArray = [4, 3, 8, 7, 4, 1, 4, 6, 7, 8];
const insertionDemoArray = [9, 5, 1, 7, 3, 3, 8, 5, 4, 9, 9, 9, 8, 5, 2];
/** Matches classic Selection Sort traces (e.g. algorithm-visualizer). */
const selectionDemoArray = [5, 1, 2, 8, 7, 7, 7, 3, 1, 8, 7, 5, 3, 7, 7];
/** Same length as other sort demos; works well with gap halving (e.g. 7, 3, 1 for n=15). */
const shellDemoArray = [9, 5, 1, 7, 3, 3, 8, 5, 4, 9, 9, 9, 8, 5, 2];
/** n=25, K≈5; values in a wide range like algorithm-visualizer Bucket Sort. */
const bucketDemoArray = [
  410, 19, 758, 301, 647, 998, 99, 523, 166, 489, 831, 251, 674, 40, 583, 746, 178, 914, 290, 315, 503, 648, 689, 879, 758,
];
/** n=20, max=9 — matches classic Counting Sort traces (algorithm-visualizer). */
const countingDemoArray = [
  7, 6, 6, 3, 0, 9, 7, 6, 9, 3, 6, 7, 7, 2, 3, 9, 6, 8, 8, 9,
];
/** n=20 — bottom-up merge sort trace (algorithm-visualizer style). */
const mergeDemoArray = [
  49, 15, 22, 7, 31, 11, 8, 46, 3, 19, 0, 28, 33, 41, 12, 24, 38, 9, 44, 17,
];
const pancakeDemoArray = [3, 3, 4, 8, 6, 1, 5, 5, 8, 6];

function generateArray(len = 20) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
}

function bubbleSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "init-length",
    log: `Initialize N = ${n} and start Bubble Sort.`,
  });
  for (let i = 0; i < n - 1; i++) {
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      codeMarker: "start-pass",
      log: `Start pass ${i + 1}.`,
    });
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        arr: [...a],
        comparing: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        codeMarker: "compare-pair",
        log: `Compare index ${j} (${a[j]}) with index ${j + 1} (${a[j + 1]}).`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          arr: [...a],
          comparing: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          codeMarker: "swap-pair",
          log: `Swap ${a[j + 1]} and ${a[j]}.`,
        });
      }
    }
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: Array.from({ length: i + 1 }, (_, k) => n - 1 - k),
      codeMarker: "end-pass",
      log: `Pass ${i + 1} complete. Element at index ${n - i - 1} is in place.`,
    });
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Array is fully sorted.",
  });
  return steps;
}

function selectionSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const originalStr = input.join(", ");
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    log: `original array = [${originalStr}]`,
  });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({
        arr: [...a],
        comparing: [minIdx, j],
        sorted: Array.from({ length: i }, (_, k) => k),
        log:
          a[j] < a[minIdx]
            ? `Compare index ${minIdx} (${a[minIdx]}) with index ${j} (${a[j]}) — new minimum at ${j}.`
            : `Compare index ${minIdx} (${a[minIdx]}) with index ${j} (${a[j]}).`,
      });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      const vI = a[i];
      const vMin = a[minIdx];
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        arr: [...a],
        comparing: [i, minIdx],
        sorted: Array.from({ length: i }, (_, k) => k),
        log: `swap ${vI} and ${vMin}`,
      });
    }
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      log:
        minIdx === i
          ? `Index ${i} already held the minimum; no swap.`
          : `Placed minimum at index ${i}; sorted prefix is 0..${i}.`,
    });
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    log: "Array is fully sorted.",
  });
  return steps;
}

function insertionSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const originalStr = input.join(", ");
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [0],
    codeMarker: "init-length",
    log: `original array - [${originalStr}]`,
  });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({
      arr: [...a],
      comparing: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
      codeMarker: "pick-key",
      log: `insert ${key}`,
    });
    while (j >= 0 && a[j] > key) {
      const v = a[j];
      a[j + 1] = a[j];
      steps.push({
        arr: [...a],
        comparing: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        codeMarker: "shift-elem",
        log: `Shift ${v} from index ${j} to index ${j + 1}.`,
      });
      j--;
    }
    a[j + 1] = key;
    steps.push({
      arr: [...a],
      comparing: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      codeMarker: "insert-key",
      log: `Place key ${key} at index ${j + 1}.`,
    });
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Array is fully sorted.",
  });
  return steps;
}

function mergeSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const n = input.length;
  if (n === 0) return steps;
  const a = [...input];
  const aux = [...input];
  const logs: string[] = [];

  const push = (h0: number | null, h1: number | null, line?: string) => {
    if (line) logs.push(line);
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: [],
      mergeRow0: [...aux],
      mergeRow1: [...a],
      mergeHighlight0: h0,
      mergeHighlight1: h1,
      mergeLogs: [...logs],
    });
  };

  push(null, null, `Bottom-up merge sort, n=${n}. Row 0 = auxiliary, row 1 = array.`);

  for (let width = 1; width < n; width *= 2) {
    push(null, null, `Pass: merge runs of width ${width}.`);
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      if (mid >= hi) continue;
      for (let t = lo; t < hi; t++) aux[t] = a[t];
      push(null, null, `Copy a[${lo}..${hi}) to auxiliary for merge.`);
      let i = lo,
        j = mid,
        k = lo;
      while (i < mid && j < hi) {
        push(i, j, `compare index ${i} and ${j}, values: ${aux[i]} and ${aux[j]}`);
        if (aux[i] <= aux[j]) {
          a[k] = aux[i];
          logs.push(`writing smaller value ${aux[i]} to output index ${k} (left)`);
          i++;
        } else {
          a[k] = aux[j];
          logs.push(`writing smaller value ${aux[j]} to output index ${k} (right)`);
          j++;
        }
        push(null, null, `state after write at index ${k}.`);
        k++;
      }
      while (i < mid) {
        a[k] = aux[i];
        logs.push(`final copy from left: ${aux[i]} → index ${k}`);
        push(i, null, `copy remainder from auxiliary[${i}] to array[${k}].`);
        i++;
        k++;
      }
      while (j < hi) {
        a[k] = aux[j];
        logs.push(`final copy from right: ${aux[j]} → index ${k}`);
        push(null, j, `copy remainder from auxiliary[${j}] to array[${k}].`);
        j++;
        k++;
      }
      logs.push(`finished merge for range [${lo}, ${hi}).`);
      push(null, null, `final copy to original segment [${lo}, ${hi}) complete.`);
    }
  }

  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    mergeRow0: [...aux],
    mergeRow1: [...a],
    mergeHighlight0: null,
    mergeHighlight1: null,
    mergeLogs: [...logs, "Merge sort complete."],
  });
  return steps;
}

function quickSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];

  function partition(l: number, h: number): number {
    const pivot = a[h];
    let i = l - 1;
    for (let j = l; j < h; j++) {
      steps.push({ arr: [...a], comparing: [j, h], sorted: [], pivot: h, range: [l, h] });
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ arr: [...a], comparing: [i, j], sorted: [] });
      }
    }
    [a[i + 1], a[h]] = [a[h], a[i + 1]];
    steps.push({ arr: [...a], comparing: [i + 1], sorted: [] });
    return i + 1;
  }

  function sort(l: number, h: number) {
    if (l < h) {
      const pi = partition(l, h);
      sort(l, pi - 1);
      sort(pi + 1, h);
    }
  }

  sort(0, a.length - 1);
  steps.push({ arr: [...a], comparing: [], sorted: Array.from({ length: a.length }, (_, i) => i) });
  return steps;
}

function heapSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const sortedSuffix = (heapSize: number) =>
    Array.from({ length: n - heapSize }, (_, k) => heapSize + k);
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "init-length",
    log: `Initialize N = ${n} and start Heapsort.`,
  });
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "build-heap",
    log: "Build max heap from the array indices 0 .. N - 1.",
  });

  function heapify(size: number, i: number) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size) {
      steps.push({
        arr: [...a],
        comparing: [i, l],
        sorted: sortedSuffix(size),
        codeMarker: "compare-child",
        log: `Compare index ${i} (${a[i]}) with left child index ${l} (${a[l]}).`,
      });
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      steps.push({
        arr: [...a],
        comparing: [largest, r],
        sorted: sortedSuffix(size),
        codeMarker: "compare-child",
        log: `Compare index ${largest} (${a[largest]}) with right child index ${r} (${a[r]}).`,
      });
      if (a[r] > a[largest]) largest = r;
    }
    if (largest !== i) {
      steps.push({
        arr: [...a],
        comparing: [i, largest],
        sorted: sortedSuffix(size),
        codeMarker: "swap-root",
        log: `Swap index ${i} (${a[i]}) with index ${largest} (${a[largest]}).`,
      });
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({
        arr: [...a],
        comparing: [],
        sorted: sortedSuffix(size),
        codeMarker: "heapify-down",
        log: "Heapify downward to restore the max-heap property.",
      });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "build-heap",
    log: "Max heap is ready; root holds the largest value.",
  });
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      arr: [...a],
      comparing: [0, i],
      sorted: sortedSuffix(i + 1),
      codeMarker: "extract-max",
      log: `Compare index 0 (${a[0]}) with index ${i} (${a[i]}); place max at index ${i}.`,
    });
    const rootVal = a[0];
    const tailVal = a[i];
    [a[0], a[i]] = [a[i], a[0]];
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: sortedSuffix(i),
      codeMarker: "heapify-down",
      log: `Swapping elements: ${rootVal} & ${tailVal}.`,
    });
    heapify(i, 0);
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Array is fully sorted.",
  });
  return steps;
}

function shellSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const originalStr = input.join(", ");
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    log: `original array = [${originalStr}]`,
  });
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: [],
      log: `Gap of ${gap}`,
    });
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > temp) {
        const left = a[j - gap];
        steps.push({
          arr: [...a],
          comparing: [j, j - gap],
          sorted: [],
          log: `Holding: ${temp}; ${left} > ${temp} — shift ${left} from index ${j - gap} to ${j}`,
        });
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = temp;
      steps.push({
        arr: [...a],
        comparing: [j],
        sorted: [],
        log:
          j === i
            ? `Holding: ${temp}; ${a[i - gap]} <= ${temp} — no shift at gap ${gap}`
            : `Place ${temp} at index ${j}`,
      });
    }
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    log: "Array is fully sorted.",
  });
  return steps;
}

function combSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  let gap = n;
  let swapped = true;
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "init-gap",
    log: `Initialize gap = ${gap} and start Comb Sort.`,
  });
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: [],
      codeMarker: "shrink-gap",
      log: `Shrink gap to ${gap}.`,
    });
    for (let i = 0; i + gap < n; i++) {
      steps.push({
        arr: [...a],
        comparing: [i, i + gap],
        sorted: [],
        codeMarker: "compare-gap",
        log: `Compare index ${i} (${a[i]}) with index ${i + gap} (${a[i + gap]}).`,
      });
      if (a[i] > a[i + gap]) {
        [a[i], a[i + gap]] = [a[i + gap], a[i]];
        swapped = true;
        steps.push({
          arr: [...a],
          comparing: [i, i + gap],
          sorted: [],
          codeMarker: "swap-gap",
          log: `Swap ${a[i + gap]} and ${a[i]}.`,
        });
      }
    }
    steps.push({
      arr: [...a],
      comparing: [],
      sorted: gap === 1 && !swapped ? Array.from({ length: n }, (_, i) => i) : [],
      codeMarker: "end-pass",
      log: gap === 1 && !swapped ? "Final comb pass complete. Array is sorted." : `Comb pass with gap ${gap} complete.`,
    });
    if (steps.length > 500) break;
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Comb Sort is complete.",
  });
  return steps;
}

function cycleSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "init-cycle",
    log: `Initialize Cycle Sort for ${n} elements.`,
  });
  for (let cs = 0; cs < n - 1; cs++) {
    let item = a[cs];
    let pos = cs;
    steps.push({
      arr: [...a],
      comparing: [cs],
      sorted: Array.from({ length: cs }, (_, i) => i),
      codeMarker: "start-cycle",
      log: `Start cycle at index ${cs} with item ${item}.`,
    });
    for (let i = cs + 1; i < n; i++) {
      steps.push({
        arr: [...a],
        comparing: [cs, i],
        sorted: Array.from({ length: cs }, (_, i) => i),
        codeMarker: "find-position",
        log: `Check whether ${a[i]} should come before ${item}.`,
      });
      if (a[i] < item) pos++;
    }
    if (pos === cs) {
      steps.push({
        arr: [...a],
        comparing: [cs],
        sorted: Array.from({ length: cs + 1 }, (_, i) => i),
        codeMarker: "skip-cycle",
        log: `Item ${item} is already in the correct position.`,
      });
      continue;
    }
    while (item === a[pos]) pos++;
    if (pos !== cs) {
      [a[pos], item] = [item, a[pos]];
      steps.push({
        arr: [...a],
        comparing: [pos],
        sorted: Array.from({ length: cs }, (_, i) => i),
        codeMarker: "write-item",
        log: `Write item into position ${pos}.`,
      });
    }
    while (pos !== cs) {
      pos = cs;
      steps.push({
        arr: [...a],
        comparing: [cs],
        sorted: Array.from({ length: cs }, (_, i) => i),
        codeMarker: "rotate-cycle",
        log: `Rotate the cycle starting from index ${cs}.`,
      });
      for (let i = cs + 1; i < n; i++) if (a[i] < item) pos++;
      while (item === a[pos]) pos++;
      if (item !== a[pos]) {
        [a[pos], item] = [item, a[pos]];
        steps.push({
          arr: [...a],
          comparing: [pos],
          sorted: Array.from({ length: cs }, (_, i) => i),
          codeMarker: "write-item",
          log: `Write rotated item into position ${pos}.`,
        });
      }
    }
    if (steps.length > 500) break;
  }
  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Cycle Sort is complete.",
  });
  return steps;
}

function pancakeSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const originalStr = input.join(", ");
  let flipCount = 0;

  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    codeMarker: "init-length",
    log: `original array - [${originalStr}]`,
  });

  for (let size = n; size > 1; size--) {
    const round = n - size + 1;
    const sortedSuffix = Array.from({ length: n - size }, (_, k) => size + k);

    let maxIdx = 0;
    for (let i = 1; i < size; i++) {
      steps.push({
        arr: [...a],
        comparing: [i, maxIdx],
        sorted: sortedSuffix,
        codeMarker: "find-max",
        log: `Round ${round}: compare index ${i} (${a[i]}) with max index ${maxIdx} (${a[maxIdx]}).`,
      });
      if (a[i] > a[maxIdx]) maxIdx = i;
    }

    const sortedNow = Array.from({ length: n - size + 1 }, (_, k) => size - 1 + k);

    if (maxIdx !== size - 1) {
      flipCount++;
      steps.push({
        arr: [...a],
        comparing: Array.from({ length: maxIdx + 1 }, (_, k) => k),
        sorted: sortedSuffix,
        codeMarker: "flip-top",
        log: `Round ${round}: flip at ${maxIdx} (step ${flipCount}) — reverse prefix 0..${maxIdx}.`,
      });
      for (let i = 0, j = maxIdx; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]];
      steps.push({
        arr: [...a],
        comparing: [0],
        sorted: sortedSuffix,
        codeMarker: "flip-top",
        log: `Max value ${a[0]} is now at index 0.`,
      });

      flipCount++;
      steps.push({
        arr: [...a],
        comparing: Array.from({ length: size }, (_, k) => k),
        sorted: sortedSuffix,
        codeMarker: "flip-place",
        log: `Round ${round}: flip at ${size - 1} (step ${flipCount}) — reverse prefix 0..${size - 1}.`,
      });
      for (let i = 0, j = size - 1; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]];
      steps.push({
        arr: [...a],
        comparing: [size - 1],
        sorted: sortedNow,
        codeMarker: "flip-place",
        log: `Index ${size - 1} is now fixed (${a[size - 1]} in place).`,
      });
    } else {
      steps.push({
        arr: [...a],
        comparing: [size - 1],
        sorted: sortedNow,
        codeMarker: "find-max",
        log: `Round ${round}: max already at index ${size - 1}; no flip needed.`,
      });
    }
  }

  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    codeMarker: "return-sorted",
    log: "Array is fully sorted.",
  });
  return steps;
}

function countingSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const original = [...input];
  const n = original.length;
  if (n === 0) return steps;
  const max = Math.max(...original);
  const k = max + 1;
  const counts = Array(k).fill(0);
  const sortedOut: (number | null)[] = Array(n).fill(null);

  const filledSortedIndices = (): number[] => {
    const r: number[] = [];
    sortedOut.forEach((v, i) => {
      if (v !== null) r.push(i);
    });
    return r;
  };

  const push = (o: {
    inputCompare?: number[];
    countsHighlight?: number | null;
    sortedHighlight?: number | null;
  }) => {
    steps.push({
      arr: [...original],
      comparing: o.inputCompare ?? [],
      sorted: filledSortedIndices(),
      countingCounts: [...counts],
      countingSortedOut: sortedOut.map((x) => x),
      countsHighlightIdx: o.countsHighlight ?? null,
      sortedOutHighlightIdx: o.sortedHighlight ?? null,
    });
  };

  push({});
  for (let i = 0; i < n; i++) {
    counts[original[i]]++;
    push({ inputCompare: [i] });
  }
  for (let i = 1; i < k; i++) {
    counts[i] += counts[i - 1];
    push({ countsHighlight: i });
  }

  const pos = [...counts];
  for (let i = n - 1; i >= 0; i--) {
    const v = original[i];
    const outIdx = pos[v] - 1;
    sortedOut[outIdx] = v;
    pos[v]--;
    for (let j = 0; j < k; j++) counts[j] = pos[j];
    push({
      inputCompare: [i],
      countsHighlight: v,
      sortedHighlight: outIdx,
    });
  }

  steps.push({
    arr: [...original],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    countingCounts: [...counts],
    countingSortedOut: sortedOut.map((x) => x as number),
    countsHighlightIdx: null,
    sortedOutHighlightIdx: null,
  });
  return steps;
}

function radixSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const max = Math.max(...a);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = Array(n).fill(0);
    const count = Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      count[Math.floor(a[i] / exp) % 10]++;
      steps.push({ arr: [...a], comparing: [i], sorted: [] });
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[count[digit] - 1] = a[i];
      count[digit]--;
    }
    for (let i = 0; i < n; i++) {
      a[i] = output[i];
      steps.push({ arr: [...a], comparing: [i], sorted: [] });
    }
  }
  steps.push({ arr: [...a], comparing: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

function cloneBuckets(b: number[][]): number[][] {
  return b.map((row) => [...row]);
}

function bucketSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  if (n === 0) return steps;
  const max = Math.max(...a);
  const bucketCount = Math.ceil(Math.sqrt(n));
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  steps.push({
    arr: [...a],
    comparing: [],
    sorted: [],
    buckets: cloneBuckets(buckets),
    log: `Bucket Sort: n=${n}, ${bucketCount} buckets, max=${max}.`,
  });

  for (let i = 0; i < n; i++) {
    const bi = Math.min(Math.floor((a[i] / (max + 1)) * bucketCount), bucketCount - 1);
    buckets[bi].push(a[i]);
    steps.push({
      arr: [...a],
      comparing: [i],
      sorted: [],
      buckets: cloneBuckets(buckets),
      log: `Distribute a[${i}] = ${a[i]} → bucket ${bi}.`,
    });
  }

  for (let bi = 0; bi < bucketCount; bi++) {
    if (buckets[bi].length > 0) {
      buckets[bi].sort((x, y) => x - y);
      steps.push({
        arr: [...a],
        comparing: [],
        sorted: [],
        buckets: cloneBuckets(buckets),
        log: `Sort bucket ${bi}.`,
      });
    }
  }

  let idx = 0;
  for (let bi = 0; bi < bucketCount; bi++) {
    while (buckets[bi].length > 0) {
      const val = buckets[bi].shift()!;
      a[idx] = val;
      steps.push({
        arr: [...a],
        comparing: [idx],
        sorted: Array.from({ length: idx }, (_, k) => k),
        buckets: cloneBuckets(buckets),
        log: `Concatenate from bucket ${bi}: ${val} → a[${idx}].`,
      });
      idx++;
    }
  }

  steps.push({
    arr: [...a],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    buckets: cloneBuckets(buckets),
    log: "Bucket sort complete.",
  });
  return steps;
}

function pigeonholeSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const min = Math.min(...a);
  const max = Math.max(...a);
  const range = max - min + 1;
  const holes = Array(range).fill(0);
  for (let i = 0; i < n; i++) {
    holes[a[i] - min]++;
    steps.push({ arr: [...a], comparing: [i], sorted: [] });
  }
  let idx = 0;
  for (let i = 0; i < range; i++) {
    while (holes[i] > 0) {
      a[idx] = i + min;
      steps.push({ arr: [...a], comparing: [idx], sorted: Array.from({ length: idx }, (_, k) => k) });
      idx++;
      holes[i]--;
    }
  }
  steps.push({ arr: [...a], comparing: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

// For non-sorting bar algorithms
function binarySearchSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input].sort((x, y) => x - y);
  const target = a[Math.floor(Math.random() * a.length)];
  let lo = 0, hi = a.length - 1;
  steps.push({
    arr: a,
    comparing: [],
    sorted: [],
    range: [lo, hi],
    codeMarker: "init-bounds",
    log: `Searching for ${target} in the sorted array.`,
    target,
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      arr: a,
      comparing: [mid],
      sorted: [],
      range: [lo, hi],
      codeMarker: "compute-mid",
      log: `Checking middle index ${mid} with value ${a[mid]}.`,
      target,
    });
    if (a[mid] === target) {
      steps.push({
        arr: a,
        comparing: [mid],
        sorted: [mid],
        range: [lo, hi],
        codeMarker: "check-found",
        log: `Found target ${target} at index ${mid}.`,
        target,
      });
      return steps;
    }
    if (a[mid] < target) {
      steps.push({
        arr: a,
        comparing: [mid],
        sorted: [],
        range: [lo, hi],
        codeMarker: "move-right",
        log: `${a[mid]} is smaller than ${target}, moving right.`,
        target,
      });
      lo = mid + 1;
    } else {
      steps.push({
        arr: a,
        comparing: [mid],
        sorted: [],
        range: [lo, hi],
        codeMarker: "move-left",
        log: `${a[mid]} is larger than ${target}, moving left.`,
        target,
      });
      hi = mid - 1;
    }
  }
  steps.push({
    arr: a,
    comparing: [],
    sorted: [],
    codeMarker: "return-missing",
    log: `Target ${target} was not found.`,
    target,
  });
  return steps;
}

function maxSubarraySteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = input.map(v => v - 50); // center around 0 for Kadane's
  let maxSum = -Infinity, curSum = 0, start = 0, bestStart = 0, bestEnd = 0;
  for (let i = 0; i < a.length; i++) {
    curSum += a[i];
    steps.push({ arr: input, comparing: Array.from({ length: i - start + 1 }, (_, k) => start + k), sorted: [] });
    if (curSum > maxSum) {
      maxSum = curSum;
      bestStart = start;
      bestEnd = i;
    }
    if (curSum < 0) {
      curSum = 0;
      start = i + 1;
    }
  }
  steps.push({ arr: input, comparing: [], sorted: Array.from({ length: bestEnd - bestStart + 1 }, (_, k) => bestStart + k) });
  return steps;
}

function slidingWindowSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const k = 4;
  for (let i = 0; i <= input.length - k; i++) {
    const window = Array.from({ length: k }, (_, j) => i + j);
    steps.push({ arr: input, comparing: window, sorted: [] });
  }
  return steps;
}

function boyerMooreSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  // Plant a majority element
  const a = [...input];
  const majority = a[0];
  let candidate = 0, count = 0;
  for (let i = 0; i < a.length; i++) {
    if (count === 0) {
      candidate = a[i];
      count = 1;
    } else if (a[i] === candidate) {
      count++;
    } else {
      count--;
    }
    steps.push({ arr: a, comparing: [i], sorted: candidate === a[i] ? [i] : [] });
  }
  // Verify
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === candidate) c++;
    steps.push({ arr: a, comparing: [i], sorted: a[i] === candidate ? [i] : [] });
  }
  return steps;
}

function jobSchedulingSteps(input: number[]): Step[] {
  // Treat bars as job profits, schedule greedily
  const steps: Step[] = [];
  const indexed = input.map((v, i) => ({ val: v, idx: i }));
  indexed.sort((a, b) => b.val - a.val);
  const selected: number[] = [];
  for (const job of indexed) {
    selected.push(job.idx);
    steps.push({ arr: input, comparing: [job.idx], sorted: [...selected] });
    if (selected.length >= 8) break; // limit slots
  }
  return steps;
}

function shortestUnsortedSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  let start = -1, end = -1;
  const sorted = [...a].sort((x, y) => x - y);
  for (let i = 0; i < n; i++) {
    steps.push({ arr: a, comparing: [i], sorted: [] });
    if (a[i] !== sorted[i]) {
      if (start === -1) start = i;
      end = i;
    }
  }
  if (start !== -1) {
    steps.push({ arr: a, comparing: Array.from({ length: end - start + 1 }, (_, k) => start + k), sorted: [] });
  }
  return steps;
}

function lisBarSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...input];
  const n = a.length;
  const dp = Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      steps.push({ arr: a, comparing: [j, i], sorted: [] });
    }
    // Highlight elements that are part of current LIS ending at i
    const lisIndices: number[] = [];
    for (let k = 0; k <= i; k++) if (dp[k] > 0) lisIndices.push(k);
    steps.push({ arr: a, comparing: [i], sorted: lisIndices.filter(k => dp[k] === dp[i]) });
  }
  steps.push({ arr: a, comparing: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

function getSteps(algorithmName: string, input: number[]): Step[] {
  switch (algorithmName) {
    case "Bubble Sort": return bubbleSortSteps(input);
    case "Selection Sort": return selectionSortSteps(input);
    case "Insertion Sort": return insertionSortSteps(input);
    case "Merge Sort": return mergeSortSteps(input);
    case "Quicksort": return quickSortSteps(input);
    case "Heapsort": return heapSortSteps(input);
    case "Shellsort": return shellSortSteps(input);
    case "Comb Sort": return combSortSteps(input);
    case "Cycle Sort": return cycleSortSteps(input);
    case "Pancake Sort": return pancakeSortSteps(input);
    case "Counting Sort": return countingSortSteps(input);
    case "Radix Sort": return radixSortSteps(input);
    case "Bucket Sort": return bucketSortSteps(input);
    case "Pigeonhole Sort": return pigeonholeSortSteps(input);
    case "Binary Search": return binarySearchSteps(input);
    case "Maximum Subarray": return maxSubarraySteps(input);
    case "Sliding Window": return slidingWindowSteps(input);
    case "Boyer–Moore's Majority Vote": return boyerMooreSteps(input);
    case "Job Scheduling Problem": return jobSchedulingSteps(input);
    case "Shortest Unsorted Continuous Subarray": return shortestUnsortedSteps(input);
    case "Longest Increasing Subsequence": return lisBarSteps(input);
    default: return bubbleSortSteps(input);
  }
}

export function BarChartViz({ isPlaying, speed, algorithmName, onStep, onCodeMarkerChange }: Props) {
  const [arr, setArr] = useState(() => generateArray());
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<Set<number>>(new Set());
  const [pivotIdx, setPivotIdx] = useState<number | undefined>();
  const [range, setRange] = useState<[number, number] | undefined>();
  const [log, setLog] = useState<string>("");
  const [target, setTarget] = useState<number | null>(null);
  const [buckets, setBuckets] = useState<number[][]>([]);
  const [countingCountsVis, setCountingCountsVis] = useState<number[]>([]);
  const [countingSortedVis, setCountingSortedVis] = useState<Array<number | null>>([]);
  const [countsFocusIdx, setCountsFocusIdx] = useState<number | null>(null);
  const [sortedOutFocusIdx, setSortedOutFocusIdx] = useState<number | null>(null);
  const [mergeRow0, setMergeRow0] = useState<number[]>([]);
  const [mergeRow1, setMergeRow1] = useState<number[]>([]);
  const [mergeH0, setMergeH0] = useState<number | null>(null);
  const [mergeH1, setMergeH1] = useState<number | null>(null);
  const [mergeLogLines, setMergeLogLines] = useState<string[]>([]);
  const stepRef = useRef(0);
  const stepsRef = useRef<Step[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isBinarySearch = algorithmName === "Binary Search";
  const isBubbleSort = algorithmName === "Bubble Sort";
  const isCombSort = algorithmName === "Comb Sort";
  const isCycleSort = algorithmName === "Cycle Sort";
  const isHeapsort = algorithmName === "Heapsort";
  const isInsertionSort = algorithmName === "Insertion Sort";
  const isSelectionSort = algorithmName === "Selection Sort";
  const isShellsort = algorithmName === "Shellsort";
  const isBucketSort = algorithmName === "Bucket Sort";
  const isCountingSort = algorithmName === "Counting Sort";
  const isMergeSort = algorithmName === "Merge Sort";
  const isPancakeSort = algorithmName === "Pancake Sort";

  const reset = useCallback(() => {
    const newArr = isBubbleSort
      ? [...bubbleDemoArray]
      : isCombSort
        ? [...combDemoArray]
        : isCycleSort
          ? [...cycleDemoArray]
          : isHeapsort
            ? [...heapsortDemoArray]
            : isInsertionSort
              ? [...insertionDemoArray]
              : isSelectionSort
                ? [...selectionDemoArray]
                : isShellsort
                  ? [...shellDemoArray]
                  : isCountingSort
                    ? [...countingDemoArray]
                    : isMergeSort
                      ? [...mergeDemoArray]
                      : isBucketSort
                        ? [...bucketDemoArray]
                        : isPancakeSort
                          ? [...pancakeDemoArray]
                          : generateArray();
    setArr(newArr);
    setComparing([]);
    setSorted(new Set());
    setPivotIdx(undefined);
    setRange(undefined);
    setLog("");
    setTarget(null);
    stepRef.current = 0;
    stepsRef.current = getSteps(algorithmName, newArr);
    const z = stepsRef.current[0];
    setBuckets(z?.buckets ?? []);
    setCountingCountsVis(z?.countingCounts ?? []);
    setCountingSortedVis(z?.countingSortedOut ?? []);
    setCountsFocusIdx(z?.countsHighlightIdx ?? null);
    setSortedOutFocusIdx(z?.sortedOutHighlightIdx ?? null);
    setMergeRow0(z?.mergeRow0 ?? []);
    setMergeRow1(z?.mergeRow1 ?? []);
    setMergeH0(z?.mergeHighlight0 ?? null);
    setMergeH1(z?.mergeHighlight1 ?? null);
    setMergeLogLines(z?.mergeLogs ?? []);
    onCodeMarkerChange?.(z?.codeMarker ?? null);
    onStep?.(0, stepsRef.current.length);
  }, [algorithmName, isBubbleSort, isCombSort, isCycleSort, isHeapsort, isInsertionSort, isSelectionSort, isShellsort, isCountingSort, isMergeSort, isBucketSort, isPancakeSort, onCodeMarkerChange, onStep]);

  useEffect(() => {
    reset();
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying && stepsRef.current.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= stepsRef.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        const s = stepsRef.current[stepRef.current];
        setArr(s.arr);
        setComparing(s.comparing);
        setSorted(new Set(s.sorted));
        setPivotIdx(s.pivot);
        setRange(s.range);
        setLog(s.log ?? "");
        setTarget(s.target ?? null);
        setBuckets(s.buckets ?? []);
        setCountingCountsVis(s.countingCounts ?? []);
        setCountingSortedVis(s.countingSortedOut ?? []);
        setCountsFocusIdx(s.countsHighlightIdx ?? null);
        setSortedOutFocusIdx(s.sortedOutHighlightIdx ?? null);
        setMergeRow0(s.mergeRow0 ?? []);
        setMergeRow1(s.mergeRow1 ?? []);
        setMergeH0(s.mergeHighlight0 ?? null);
        setMergeH1(s.mergeHighlight1 ?? null);
        setMergeLogLines(s.mergeLogs ?? []);
        onCodeMarkerChange?.(s.codeMarker ?? null);
        onStep?.(stepRef.current, stepsRef.current.length);
        stepRef.current++;
      }, Math.max(10, 500 - speed * 45));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const maxVal = Math.max(1, ...arr);

  if (isMergeSort) {
    const n = Math.max(arr.length, mergeRow0.length, mergeRow1.length, 1);
    const minW = Math.max(n * 22, 120);
    const row0 = mergeRow0.length >= n ? mergeRow0 : arr;
    const row1 = mergeRow1.length >= n ? mergeRow1 : arr;
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Array2DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex gap-2">
              <div className="flex flex-col shrink-0 text-[10px] text-muted-foreground font-mono pt-6 gap-2 w-4">
                <span className="h-7 flex items-center">0</span>
                <span className="h-7 flex items-center">1</span>
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="flex justify-start gap-0.5 mb-2"
                  style={{ minWidth: `${minW}px` }}
                >
                  {Array.from({ length: n }, (_, i) => (
                    <div key={`m2d-h-${i}`} className="w-5 shrink-0 text-center text-[9px] text-muted-foreground">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-start gap-0.5 mb-2" style={{ minWidth: `${minW}px` }}>
                  {Array.from({ length: n }, (_, i) => {
                    const val = row0[i] ?? 0;
                    const hi = mergeH0 === i;
                    return (
                      <div
                        key={`m2d-r0-${i}`}
                        className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                        style={{
                          background: hi ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                          borderColor: hi ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                          color: "hsl(150, 20%, 92%)",
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-start gap-0.5" style={{ minWidth: `${minW}px` }}>
                  {Array.from({ length: n }, (_, i) => {
                    const val = row1[i] ?? 0;
                    const hi = mergeH1 === i;
                    return (
                      <div
                        key={`m2d-r1-${i}`}
                        className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                        style={{
                          background: hi ? "hsl(224, 85%, 58%)" : "hsl(150, 10%, 22%)",
                          borderColor: hi ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                          color: "hsl(150, 20%, 92%)",
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

        <div className="w-full mt-4 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {mergeLogLines.length > 0 ? (
              mergeLogLines.slice(-10).map((entry, index) => (
                <div key={`${index}-${entry.slice(0, 48)}`}>{entry}</div>
              ))
            ) : (
              <div>Press play to start Merge Sort.</div>
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

  if (isCountingSort) {
    const n = arr.length;
    const k = countingCountsVis.length;
    const minW = (len: number) => Math.max(len * 22, 120);
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mt-0">
          <div className="text-[10px] text-muted-foreground mb-2">Array</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex justify-center gap-0.5 mb-2 min-w-min mx-auto" style={{ minWidth: `${minW(n)}px` }}>
              {arr.map((_, i) => (
                <div key={`cnt-in-idx-${i}`} className="w-5 shrink-0 text-center text-[9px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-0.5 min-w-min mx-auto" style={{ minWidth: `${minW(n)}px` }}>
              {arr.map((val, i) => (
                <div
                  key={`cnt-in-${i}`}
                  className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Counts</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            {k === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-2">Press play to start.</div>
            ) : (
              <>
                <div className="flex justify-center gap-0.5 mb-2 min-w-min mx-auto" style={{ minWidth: `${minW(k)}px` }}>
                  {countingCountsVis.map((_, i) => (
                    <div key={`cnt-c-idx-${i}`} className="w-5 shrink-0 text-center text-[9px] text-muted-foreground">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-0.5 min-w-min mx-auto" style={{ minWidth: `${minW(k)}px` }}>
                  {countingCountsVis.map((val, i) => (
                    <div
                      key={`cnt-c-${i}`}
                      className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                      style={{
                        background: countsFocusIdx === i
                          ? "hsl(224, 85%, 58%)"
                          : "hsl(150, 10%, 22%)",
                        borderColor: countsFocusIdx === i ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                        color: "hsl(150, 20%, 92%)",
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Sorted Array</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex justify-center gap-0.5 mb-2 min-w-min mx-auto" style={{ minWidth: `${minW(n)}px` }}>
              {arr.map((_, i) => (
                <div key={`cnt-out-idx-${i}`} className="w-5 shrink-0 text-center text-[9px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-0.5 min-w-min mx-auto" style={{ minWidth: `${minW(n)}px` }}>
              {(countingSortedVis.length ? countingSortedVis : Array(n).fill(null)).map((val, i) => (
                <div
                  key={`cnt-out-${i}`}
                  className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                  style={{
                    background: sortedOutFocusIdx === i
                      ? "hsl(224, 85%, 58%)"
                      : val !== null && sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: sortedOutFocusIdx === i ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val === null ? "—" : val}
                </div>
              ))}
            </div>
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

  if (isBucketSort) {
    const bucketCount = buckets.length;
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Chart</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto min-h-[7.5rem]">
            <div
              className="h-full flex items-end justify-center gap-0.5 mx-auto"
              style={{ minWidth: `${Math.max(arr.length * 22, 120)}px` }}
            >
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 min-w-[14px] max-w-6 flex flex-col items-center justify-end gap-1 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
            <div className="flex justify-center gap-0.5 mb-2 min-w-min mx-auto" style={{ minWidth: `${Math.max(arr.length * 22, 120)}px` }}>
              {arr.map((_, i) => (
                <div key={`bkt-arr-idx-${i}`} className="w-5 shrink-0 text-center text-[9px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-0.5 min-w-min mx-auto" style={{ minWidth: `${Math.max(arr.length * 22, 120)}px` }}>
              {arr.map((val, i) => (
                <div
                  key={`bkt-arr-${i}`}
                  className="w-5 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">Buckets</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 flex-1 min-h-[6rem] overflow-y-auto">
            {bucketCount === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-2">Press play to start.</div>
            ) : (
              buckets.map((row, bi) => (
                <div key={`bucket-row-${bi}`} className="flex flex-wrap items-center gap-1 mb-2 last:mb-0">
                  <span className="w-4 shrink-0 text-[10px] text-muted-foreground font-mono">{bi}</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {row.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    ) : (
                      row.map((v, j) => (
                        <div
                          key={`${bi}-${j}-${v}`}
                          className="min-w-[1.75rem] px-1 h-6 flex items-center justify-center text-[10px] font-mono border border-[hsl(150,10%,28%)] bg-[hsl(150,10%,18%)] text-[hsl(150,20%,88%)]"
                        >
                          {v}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
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

  if (isBinarySearch) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const inRange = range ? i >= range[0] && i <= range[1] : true;
                const isComparing = comparing.includes(i);
                const isFound = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-12 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isFound
                          ? "hsl(145, 60%, 45%)"
                          : isComparing
                            ? "hsl(224, 85%, 58%)"
                            : inRange
                              ? "hsl(0, 0%, 72%)"
                              : "hsl(150, 10%, 24%)",
                        opacity: inRange ? 1 : 0.35,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-8 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => {
                const inRange = range ? i >= range[0] && i <= range[1] : true;
                const isComparing = comparing.includes(i);
                const isFound = sorted.has(i);
                return (
                  <div
                    key={`val-${i}`}
                    className="w-8 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                    style={{
                      background: isFound
                        ? "hsl(145, 60%, 45%)"
                        : isComparing
                          ? "hsl(224, 85%, 58%)"
                          : inRange
                            ? "hsl(150, 10%, 22%)"
                            : "hsl(150, 10%, 15%)",
                      borderColor: isComparing ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                      color: "hsl(150, 20%, 92%)",
                      opacity: inRange ? 1 : 0.35,
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{target !== null ? `Target: ${target}` : "Target: -"}</div>
            <div>{log || "Press play to start the search."}</div>
          </div>
        </div>

        <button
          onClick={reset}
          className="mx-auto mt-3 mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Generate New Array
        </button>
      </div>
    );
  }

  if (isBubbleSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`bubble-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Bubble Sort."}</div>
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

  if (isInsertionSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`ins-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Insertion Sort."}</div>
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

  if (isSelectionSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`sel-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Selection Sort."}</div>
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

  if (isShellsort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`shell-idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`shell-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Shellsort."}</div>
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

  if (isPancakeSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`pan-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Pancake Sort."}</div>
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

  if (isCombSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`comb-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Comb Sort."}</div>
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

  if (isCycleSort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`cycle-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Cycle Sort."}</div>
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

  if (isHeapsort) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-2">ChartTracer</div>
          <div className="flex-1 border border-border/20 bg-black/10 rounded-md p-4">
            <div className="h-full flex items-end justify-center gap-3">
              {arr.map((val, i) => {
                const isComparing = comparing.includes(i);
                const isSorted = sorted.has(i);
                return (
                  <div key={i} className="flex-1 max-w-10 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxVal) * 78}%`,
                        background: isComparing
                          ? "hsl(224, 85%, 58%)"
                          : isSorted
                            ? "hsl(145, 60%, 45%)"
                            : "hsl(0, 0%, 72%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {arr.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {arr.map((val, i) => (
                <div
                  key={`heap-val-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: comparing.includes(i)
                      ? "hsl(224, 85%, 58%)"
                      : sorted.has(i)
                        ? "hsl(145, 60%, 45%)"
                        : "hsl(150, 10%, 22%)",
                    borderColor: comparing.includes(i) ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            <div>{log || "Press play to start Heapsort."}</div>
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end justify-center gap-[2px] px-4 pb-4">
        {arr.map((val, i) => {
          const isComparing = comparing.includes(i);
          const isSorted = sorted.has(i);
          const isPivot = pivotIdx === i;
          return (
            <motion.div
              key={i}
              layout
              transition={{ duration: 0.1 }}
              className="flex-1 rounded-t-sm min-w-[8px] max-w-[30px]"
              style={{
                height: `${(val / maxVal) * 100}%`,
                background: isSorted
                  ? "hsl(145, 60%, 45%)"
                  : isPivot
                  ? "hsl(280, 60%, 55%)"
                  : isComparing
                  ? "hsl(45, 90%, 55%)"
                  : "hsl(150, 20%, 30%)",
                boxShadow: isComparing
                  ? "0 0 10px hsl(45, 90%, 55%, 0.5)"
                  : isSorted
                  ? "0 0 8px hsl(145, 60%, 45%, 0.3)"
                  : isPivot
                  ? "0 0 10px hsl(280, 60%, 55%, 0.5)"
                  : "none",
              }}
            />
          );
        })}
      </div>
      <button
        onClick={reset}
        className="mx-auto mb-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"
      >
        Generate New Array
      </button>
    </div>
  );
}
