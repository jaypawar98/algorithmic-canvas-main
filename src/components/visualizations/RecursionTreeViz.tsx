import { useEffect, useRef, useState } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
  onCodeMarkerChange?: (marker: string | null) => void;
}

interface TreeNode {
  id: number;
  label: string;
  value?: string;
  x: number;
  y: number;
  parentId: number | null;
}

interface SumSubsetStep {
  currentIndex: number;
  values: number[];
  selected: boolean[];
  logs: string[];
  codeMarker: string | null;
}

function buildFactorialTree(n: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (let i = 0; i <= n; i++) {
    nodes.push({
      id: i,
      label: `${n - i}!`,
      value: i === n ? "1" : undefined,
      x: 175,
      y: 25 + i * 42,
      parentId: i === 0 ? null : i - 1,
    });
  }
  for (let i = n - 1; i >= 0; i--) {
    const val = Array.from({ length: n - i }, (_, k) => k + 1).reduce((a, b) => a * b, 1);
    nodes[i].value = String(val);
  }
  return nodes;
}

function buildGCDTree(a: number, b: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  let id = 0;
  function gcd(x: number, y: number, depth: number, parentId: number | null): number {
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      label: `gcd(${x},${y})`,
      x: 175,
      y: 25 + depth * 50,
      parentId,
    });
    if (y === 0) {
      nodes[nodeId].value = String(x);
      return x;
    }
    const result = gcd(y, x % y, depth + 1, nodeId);
    nodes[nodeId].value = String(result);
    return result;
  }
  gcd(a, b, 0, null);
  return nodes;
}

function buildFibTree(n: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  let id = 0;

  function fib(val: number, depth: number, parentId: number | null, xHint: number): number {
    if (id > 30) return 0;
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      label: `F(${val})`,
      x: xHint,
      y: 20 + depth * 55,
      parentId,
    });
    if (val <= 1) {
      nodes[nodeId].value = String(val);
      return val;
    }
    const left = fib(val - 1, depth + 1, nodeId, xHint - 50 / (depth + 1));
    const right = fib(val - 2, depth + 1, nodeId, xHint + 50 / (depth + 1));
    nodes[nodeId].value = String(left + right);
    return left + right;
  }
  fib(Math.min(n, 5), 0, null, 175);
  return nodes;
}

function buildSubsetSumTree(set: number[], target: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  let id = 0;

  function solve(idx: number, sum: number, depth: number, parentId: number | null, xHint: number) {
    if (id > 30) return;
    const nodeId = id++;
    const label = idx >= set.length ? `sum=${sum}` : `[${idx}]sum=${sum}`;
    const found = sum === target;
    const pruned = sum > target;
    nodes.push({
      id: nodeId,
      label,
      value: found ? "ok" : pruned ? "x" : undefined,
      x: xHint,
      y: 20 + depth * 50,
      parentId,
    });
    if (found || pruned || idx >= set.length) return;
    const spread = 120 / (depth + 1);
    solve(idx + 1, sum + set[idx], depth + 1, nodeId, xHint - spread);
    solve(idx + 1, sum, depth + 1, nodeId, xHint + spread);
  }
  solve(0, 0, 0, null, 175);
  return nodes;
}

function buildSubsetSumSteps(): SumSubsetStep[] {
  const values = [11, 16, 15, 29, 7, 16, 4, 8, 17, 3];
  const target = 40;
  const steps: SumSubsetStep[] = [];
  const selected = Array(values.length).fill(false);
  const baseLogs = [
    `The given set is: ${values.join(",")}`,
    `Desired sum is:${target}`,
    `The possible subsets of sum ${target} are:`,
  ];

  const pushStep = (currentIndex: number, codeMarker: string | null, message?: string) => {
    const logs = message ? [...baseLogs, message] : [...baseLogs];
    steps.push({
      currentIndex,
      values,
      selected: [...selected],
      logs,
      codeMarker,
    });
  };

  function solve(idx: number, current: number[]) {
    const sum = current.reduce((acc, value) => acc + value, 0);
    pushStep(idx, "check-found", `Checking subset {${current.join(", ")}} with sum ${sum}.`);
    if (sum === target) {
      pushStep(idx, "check-found", `Found subset: {${current.join(", ")}}`);
      return;
    }

    pushStep(idx, "check-bounds", `Stopping branch at index ${idx} with sum ${sum}.`);
    if (idx >= values.length || sum > target) return;

    selected[idx] = true;
    pushStep(idx, "include-item", `Including ${values[idx]} in the subset.`);
    pushStep(idx, "recurse-include", `Exploring with ${values[idx]} included.`);
    solve(idx + 1, [...current, values[idx]]);

    selected[idx] = false;
    pushStep(idx, "backtrack-item", `Backtracking and removing ${values[idx]}.`);
    pushStep(idx, "recurse-exclude", `Exploring without ${values[idx]}.`);
    solve(idx + 1, current);
  }

  pushStep(0, "init-search", "Starting the subset search.");
  solve(0, []);
  pushStep(values.length, "return-result", "Finished exploring all subset combinations.");
  return steps.slice(0, 80);
}

function getNodes(name: string): TreeNode[] {
  if (name.includes("Factorial")) return buildFactorialTree(6);
  if (name.includes("GCD") || name.includes("Euclidean")) return buildGCDTree(48, 18);
  if (name.includes("Fibonacci")) return buildFibTree(5);
  if (name.includes("Sum of Subsets")) return buildSubsetSumTree([3, 5, 6, 7], 15);
  return buildFactorialTree(6);
}

export function RecursionTreeViz({ isPlaying, speed, algorithmName, onCodeMarkerChange }: Props) {
  const isSubsetSum = algorithmName.includes("Sum of Subsets");
  const allNodes = useRef(getNodes(algorithmName));
  const subsetStepsRef = useRef<SumSubsetStep[]>(isSubsetSum ? buildSubsetSumSteps() : []);
  const [visibleCount, setVisibleCount] = useState(0);
  const [subsetStepIndex, setSubsetStepIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    allNodes.current = getNodes(algorithmName);
    subsetStepsRef.current = algorithmName.includes("Sum of Subsets") ? buildSubsetSumSteps() : [];
    reset();
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        if (isSubsetSum) {
          if (stepRef.current >= subsetStepsRef.current.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
          }
          const step = subsetStepsRef.current[stepRef.current];
          setSubsetStepIndex(stepRef.current);
          onCodeMarkerChange?.(step.codeMarker);
          stepRef.current++;
          return;
        }

        if (stepRef.current > allNodes.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setVisibleCount(stepRef.current);
        stepRef.current++;
      }, Math.max(200, 800 - speed * 70));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, isSubsetSum, onCodeMarkerChange]);

  const reset = () => {
    setVisibleCount(0);
    setSubsetStepIndex(0);
    stepRef.current = isSubsetSum ? 1 : 0;
    if (isSubsetSum) {
      onCodeMarkerChange?.(subsetStepsRef.current[0]?.codeMarker ?? null);
    }
  };

  if (isSubsetSum) {
    const current = subsetStepsRef.current[Math.min(subsetStepIndex, Math.max(0, subsetStepsRef.current.length - 1))];
    if (!current) return null;

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-4xl">
            <div className="text-[10px] text-muted-foreground mb-3">Set</div>
            <div className="flex justify-center gap-1 mb-2">
              {current.values.map((_, index) => (
                <div key={`index-${index}`} className="w-10 text-center text-[10px] text-muted-foreground">
                  {index}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {current.values.map((value, index) => {
                const isCurrent = index === current.currentIndex;
                const isSelected = current.selected[index];
                return (
                  <div
                    key={`${index}-${value}`}
                    className="w-10 h-8 flex items-center justify-center text-xs font-mono border transition-colors"
                    style={{
                      background: isCurrent
                        ? "hsl(224, 85%, 58%)"
                        : isSelected
                          ? "hsl(145, 55%, 32%)"
                          : "hsl(150, 10%, 22%)",
                      borderColor: isCurrent
                        ? "hsl(224, 85%, 68%)"
                        : isSelected
                          ? "hsl(145, 60%, 45%)"
                          : "hsl(150, 10%, 30%)",
                      color: "hsl(150, 20%, 92%)",
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 px-8 py-4 min-h-40">
          <div className="text-[10px] text-muted-foreground mb-3">Console</div>
          <div className="space-y-2 font-mono text-xs text-foreground/90">
            {current.logs.map((line, index) => (
              <div key={`${index}-${line}`}>{line}</div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2 mb-2 self-center">
          Reset
        </button>
      </div>
    );
  }

  const visible = allNodes.current.slice(0, visibleCount);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 350 340" className="w-full h-full">
        {visible.map((node) => {
          if (node.parentId === null) return null;
          const parent = allNodes.current[node.parentId];
          return (
            <line
              key={`e-${node.id}`}
              x1={parent.x}
              y1={parent.y}
              x2={node.x}
              y2={node.y}
              stroke="hsl(145, 60%, 45%)"
              strokeWidth={1.5}
              opacity={0.5}
            />
          );
        })}
        {visible.map((node, i) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={20}
              fill={i === visible.length - 1 ? "hsl(145, 60%, 35%)" : "hsl(150, 20%, 12%)"}
              stroke="hsl(145, 60%, 45%)"
              strokeWidth={1.5}
            />
            <text x={node.x} y={node.y - 2} fill="hsl(150, 20%, 85%)" fontSize="8" textAnchor="middle" fontFamily="monospace">
              {node.label}
            </text>
            {node.value && i < visible.length - 1 && (
              <text x={node.x} y={node.y + 10} fill="hsl(145, 60%, 65%)" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight={700}>
                ={node.value}
              </text>
            )}
          </g>
        ))}
      </svg>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2">
        Reset
      </button>
    </div>
  );
}
