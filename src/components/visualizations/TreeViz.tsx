import { useState, useEffect, useRef, useMemo } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
  onCodeMarkerChange?: (marker: string | null) => void;
}

interface TNode {
  id: number;
  value: number;
  x: number;
  y: number;
  left: number | null;
  right: number | null;
}

interface TreeStep {
  nodes: TNode[];
  highlighted: number[];
  found?: number | null;
  label?: string;
  edgeHighlights?: string[];
  codeMarker?: string | null;
  elements?: number[];
  activeElementIndex?: number | null;
  logs?: string[];
  printOrder?: number[];
}

function layoutTree(nodes: TNode[], rootIdx: number, x: number, y: number, spread: number) {
  if (rootIdx < 0 || rootIdx >= nodes.length) return;
  nodes[rootIdx].x = x;
  nodes[rootIdx].y = y;
  if (nodes[rootIdx].left !== null) layoutTree(nodes, nodes[rootIdx].left, x - spread, y + 55, spread * 0.55);
  if (nodes[rootIdx].right !== null) layoutTree(nodes, nodes[rootIdx].right, x + spread, y + 55, spread * 0.55);
}

function buildBSTSteps(): TreeStep[] {
  const values = [50, 30, 70, 20, 40, 60, 80, 10, 35, 55];
  const steps: TreeStep[] = [];
  const nodes: TNode[] = [];
  const baseLogs: string[] = [];

  function insert(val: number): number {
    const idx = nodes.length;
    nodes.push({ id: idx, value: val, x: 0, y: 0, left: null, right: null });
    if (idx === 0) {
      layoutTree(nodes, 0, 200, 30, 90);
      baseLogs.push(`${val} inserted as root of tree`);
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        highlighted: [0],
        label: `Insert ${val} (root)`,
        codeMarker: "insert-root",
        elements: values,
        activeElementIndex: idx,
        logs: [...baseLogs],
      });
      return idx;
    }
    let cur = 0;
    const path: number[] = [cur];
    while (true) {
      baseLogs.push(`${val} vs ${nodes[cur].value}`);
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        highlighted: [...path],
        label: `Compare ${val} with ${nodes[cur].value}`,
        codeMarker: "choose-direction",
        elements: values,
        activeElementIndex: idx,
        logs: [...baseLogs],
      });
      if (val < nodes[cur].value) {
        if (nodes[cur].left === null) { nodes[cur].left = idx; break; }
        cur = nodes[cur].left;
      } else {
        if (nodes[cur].right === null) { nodes[cur].right = idx; break; }
        cur = nodes[cur].right;
      }
      path.push(cur);
    }
    layoutTree(nodes, 0, 200, 30, 90);
    baseLogs.push(`${val} inserted`);
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      highlighted: [...path, idx],
      label: `Insert ${val}`,
      codeMarker: val < nodes[path[path.length - 1]].value ? "insert-left" : "insert-right",
      elements: values,
      activeElementIndex: idx,
      logs: [...baseLogs],
    });
    return idx;
  }

  for (const v of values) insert(v);

  // Search animation
  const target = 35;
  let cur = 0;
  const searchPath: number[] = [];
  while (cur !== null && cur < nodes.length) {
    searchPath.push(cur);
    baseLogs.push(`search ${target} at ${nodes[cur].value}`);
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      highlighted: [...searchPath],
      label: `Search ${target}: at ${nodes[cur].value}`,
      codeMarker: "search-found",
      elements: values,
      activeElementIndex: values.indexOf(target),
      logs: [...baseLogs],
    });
    if (nodes[cur].value === target) {
      baseLogs.push(`${target} found`);
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        highlighted: [...searchPath],
        found: cur,
        label: `Found ${target}!`,
        codeMarker: "search-found",
        elements: values,
        activeElementIndex: values.indexOf(target),
        logs: [...baseLogs],
      });
      break;
    }
    if (target < nodes[cur].value) {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        highlighted: [...searchPath],
        label: `Go left from ${nodes[cur].value}`,
        codeMarker: "search-left",
        elements: values,
        activeElementIndex: values.indexOf(target),
        logs: [...baseLogs, `${target} < ${nodes[cur].value}, move left`],
      });
      cur = nodes[cur].left!;
    } else {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        highlighted: [...searchPath],
        label: `Go right from ${nodes[cur].value}`,
        codeMarker: "search-right",
        elements: values,
        activeElementIndex: values.indexOf(target),
        logs: [...baseLogs, `${target} > ${nodes[cur].value}, move right`],
      });
      cur = nodes[cur].right!;
    }
  }
  return steps;
}

function buildTraversalSteps(): TreeStep[] {
  const values = [5, 3, 8, 1, 4, 6, 10, 0, 2, 7, 9];
  const nodes: TNode[] = values.map((v, i) => ({ id: i, value: v, x: 0, y: 0, left: null, right: null }));
  nodes[0].left = 1; nodes[0].right = 2;
  nodes[1].left = 3; nodes[1].right = 4;
  nodes[2].left = 5; nodes[2].right = 6;
  nodes[3].left = 7; nodes[3].right = 8;
  nodes[6].left = 9; nodes[6].right = 10;
  layoutTree(nodes, 0, 200, 30, 90);

  const steps: TreeStep[] = [];
  const inorder: number[] = [];
  function dfsInorder(idx: number | null) {
    if (idx === null) {
      steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: [], label: "Check null", codeMarker: "check-null", printOrder: [...inorder], logs: ["No more nodes. Backtracking."] });
      return;
    }
    steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: [idx], label: `Go left from ${nodes[idx].value}`, codeMarker: "traverse-left", printOrder: [...inorder], logs: [`Going left from ${nodes[idx].value}`] });
    dfsInorder(nodes[idx].left);
    inorder.push(idx);
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      highlighted: [idx],
      label: `Inorder: visit ${nodes[idx].value}`,
      codeMarker: "visit-node",
      printOrder: [...inorder],
      logs: [`Printing ${nodes[idx].value}`],
    });
    steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: [idx], label: `Go right from ${nodes[idx].value}`, codeMarker: "traverse-right", printOrder: [...inorder], logs: [`Going right from ${nodes[idx].value}`] });
    dfsInorder(nodes[idx].right);
  }
  dfsInorder(0);
  return steps;
}

function buildLCASteps(): TreeStep[] {
  const values = [40, 20, 60, 10, 30, 50, 70, 5, 15, 25, 35];
  const nodes: TNode[] = values.map((v, i) => ({ id: i, value: v, x: 0, y: 0, left: null, right: null }));
  for (let i = 0; i < nodes.length; i++) {
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < nodes.length) nodes[i].left = l;
    if (r < nodes.length) nodes[i].right = r;
  }
  layoutTree(nodes, 0, 200, 25, 90);

  const steps: TreeStep[] = [];
  const p = 7, q = 9; // nodes for 5 and 25

  // Find path to p
  function findPath(root: number | null, target: number, path: number[]): boolean {
    if (root === null) return false;
    path.push(root);
    if (root === target) return true;
    if (findPath(nodes[root].left, target, path) || findPath(nodes[root].right, target, path)) return true;
    path.pop();
    return false;
  }

  const pathP: number[] = [];
  findPath(0, p, pathP);
  for (let i = 0; i <= pathP.length; i++) {
    steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: pathP.slice(0, i), label: `Path to ${values[p]}` });
  }

  const pathQ: number[] = [];
  findPath(0, q, pathQ);
  for (let i = 0; i <= pathQ.length; i++) {
    steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: [...pathP, ...pathQ.slice(0, i)], label: `Path to ${values[q]}` });
  }

  // Find LCA
  let lca = 0;
  for (let i = 0; i < Math.min(pathP.length, pathQ.length); i++) {
    if (pathP[i] === pathQ[i]) lca = pathP[i];
    else break;
  }
  steps.push({ nodes: nodes.map(n => ({ ...n })), highlighted: [...pathP, ...pathQ], found: lca, label: `LCA = ${values[lca]}` });

  return steps;
}

function buildHeapsortSteps(): TreeStep[] {
  const arr = [4, 10, 3, 5, 1, 8, 7, 2, 9, 6];
  const nodes: TNode[] = arr.map((v, i) => ({ id: i, value: v, x: 0, y: 0, left: null, right: null }));
  const steps: TreeStep[] = [];

  function rebuildTree(size: number) {
    for (let i = 0; i < size; i++) {
      nodes[i].left = 2 * i + 1 < size ? 2 * i + 1 : null;
      nodes[i].right = 2 * i + 2 < size ? 2 * i + 2 : null;
    }
    layoutTree(nodes, 0, 200, 30, 80);
  }

  function heapify(size: number, i: number) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && nodes[l].value > nodes[largest].value) largest = l;
    if (r < size && nodes[r].value > nodes[largest].value) largest = r;
    if (largest !== i) {
      steps.push({ nodes: nodes.slice(0, size).map(n => ({ ...n })), highlighted: [i, largest], label: `Swap ${nodes[i].value} ↔ ${nodes[largest].value}` });
      [nodes[i].value, nodes[largest].value] = [nodes[largest].value, nodes[i].value];
      rebuildTree(size);
      steps.push({ nodes: nodes.slice(0, size).map(n => ({ ...n })), highlighted: [largest], label: "Heapify" });
      heapify(size, largest);
    }
  }

  const size = arr.length;
  rebuildTree(size);
  steps.push({ nodes: nodes.slice(0, size).map(n => ({ ...n })), highlighted: [], label: "Initial array as tree" });

  // Build max heap
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) heapify(size, i);
  steps.push({ nodes: nodes.slice(0, size).map(n => ({ ...n })), highlighted: [0], label: "Max heap built" });

  // Extract
  for (let i = size - 1; i > 0; i--) {
    [nodes[0].value, nodes[i].value] = [nodes[i].value, nodes[0].value];
    steps.push({ nodes: nodes.slice(0, i).map(n => ({ ...n })), highlighted: [0], label: `Extract max: ${nodes[i].value}` });
    rebuildTree(i);
    heapify(i, 0);
  }

  return steps;
}

function getTreeSteps(name: string): TreeStep[] {
  if (name.includes("Binary Search Tree")) return buildBSTSteps();
  if (name.includes("Binary Tree Traversal")) return buildTraversalSteps();
  if (name.includes("Lowest Common")) return buildLCASteps();
  if (name.includes("Heapsort")) return buildHeapsortSteps();
  return buildBSTSteps();
}

export function TreeViz({ isPlaying, speed, algorithmName, onCodeMarkerChange }: Props) {
  const stepsRef = useRef<TreeStep[]>(getTreeSteps(algorithmName));
  const stepRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const [currentStep, setCurrentStep] = useState<TreeStep | null>(null);

  useEffect(() => {
    stepsRef.current = getTreeSteps(algorithmName);
    reset();
    onCodeMarkerChange?.(stepsRef.current[0]?.codeMarker ?? null);
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying && stepsRef.current.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= stepsRef.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setCurrentStep(stepsRef.current[stepRef.current]);
        onCodeMarkerChange?.(stepsRef.current[stepRef.current]?.codeMarker ?? null);
        stepRef.current++;
      }, Math.max(150, 800 - speed * 65));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    setCurrentStep(null);
    onCodeMarkerChange?.(stepsRef.current[0]?.codeMarker ?? null);
    stepRef.current = 0;
  };

  if (!currentStep) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-xs text-muted-foreground">{algorithmName} — Press Play</div>
      </div>
    );
  }

  const { nodes, highlighted, found, label, elements, activeElementIndex, logs } = currentStep;
  const highlightSet = new Set(highlighted);
  const isBST = algorithmName.includes("Binary Search Tree");
  const isTraversal = algorithmName.includes("Binary Tree Traversal");

  if (isBST) {
    return (
      <div className="w-full h-full flex flex-col">
        {label && <div className="text-xs text-muted-foreground mb-1 font-mono">{label}</div>}
        <div className="flex-1 min-h-0 border-b border-border/20 flex items-start justify-center pt-4">
          <svg viewBox="0 0 400 320" className="w-full max-w-[34rem] h-[18rem]">
            {nodes.map(n => {
              const children = [n.left, n.right].filter((c): c is number => c !== null && c < nodes.length);
              return children.map(c => (
                <line key={`${n.id}-${c}`}
                  x1={n.x} y1={n.y} x2={nodes[c].x} y2={nodes[c].y}
                  stroke={highlightSet.has(n.id) && highlightSet.has(c) ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 25%)"}
                  strokeWidth={highlightSet.has(n.id) && highlightSet.has(c) ? 2.5 : 1.5}
                  opacity={highlightSet.has(n.id) && highlightSet.has(c) ? 1 : 0.4}
                />
              ));
            })}
            {nodes.map(n => {
              const isHighlighted = highlightSet.has(n.id);
              const isFound = found === n.id;
              return (
                <g key={n.id}>
                  {isFound && (
                    <circle cx={n.x} cy={n.y} r={22} fill="none"
                      stroke="hsl(45, 90%, 55%)" strokeWidth={2.5} opacity={0.6} />
                  )}
                  <circle cx={n.x} cy={n.y} r={16}
                    fill={isFound ? "hsl(45, 90%, 55%)" : isHighlighted ? "hsl(145, 60%, 40%)" : "hsl(150, 20%, 12%)"}
                    stroke={isHighlighted ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 30%)"}
                    strokeWidth={isHighlighted ? 2 : 1}
                  />
                  <text x={n.x} y={n.y + 4}
                    fill={isFound ? "hsl(150, 30%, 4%)" : isHighlighted ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 80%)"}
                    fontSize="11" textAnchor="middle" fontWeight={600}
                  >
                    {n.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Elements</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {(elements ?? []).map((_, i) => (
                <div key={`idx-${i}`} className="w-8 text-center text-[10px] text-muted-foreground">{i}</div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {(elements ?? []).map((value, i) => (
                <div
                  key={`element-${i}`}
                  className="w-8 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: activeElementIndex === i ? "hsl(224, 85%, 58%)" : "hsl(150, 10%, 22%)",
                    borderColor: activeElementIndex === i ? "hsl(224, 85%, 68%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">Log</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            {(logs ?? []).slice(-8).map((entry, index) => (
              <div key={`${index}-${entry}`}>{entry}</div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2 self-center">Reset</button>
      </div>
    );
  }

  if (isTraversal) {
    const printOrder = currentStep.printOrder ?? [];
    return (
      <div className="w-full h-full flex flex-col">
        {label && <div className="text-xs text-muted-foreground mb-1 font-mono">{label}</div>}
        <div className="flex-1 min-h-0 border-b border-border/20 flex items-start justify-center pt-4">
          <svg viewBox="0 0 400 320" className="w-full max-w-[24rem] h-[18rem]">
            {nodes.map(n => {
              const children = [n.left, n.right].filter((c): c is number => c !== null && c < nodes.length);
              return children.map(c => (
                <line key={`${n.id}-${c}`}
                  x1={n.x} y1={n.y} x2={nodes[c].x} y2={nodes[c].y}
                  stroke={highlightSet.has(n.id) && highlightSet.has(c) ? "hsl(330, 85%, 48%)" : "hsl(150, 15%, 25%)"}
                  strokeWidth={highlightSet.has(n.id) && highlightSet.has(c) ? 2.5 : 1.5}
                  opacity={1}
                />
              ));
            })}
            {nodes.map(n => {
              const isHighlighted = highlightSet.has(n.id);
              return (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={16}
                    fill={isHighlighted ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 28%)"}
                    stroke="hsl(0, 0%, 70%)"
                    strokeWidth={1}
                  />
                  <text x={n.x} y={n.y + 4}
                    fill="hsl(150, 20%, 92%)"
                    fontSize="11" textAnchor="middle" fontWeight={600}
                  >
                    {n.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Print In-order</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {nodes.map((_, i) => (
                <div key={`idx-${i}`} className="w-7 text-center text-[10px] text-muted-foreground">{i}</div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {nodes.map((n, i) => (
                <div
                  key={`print-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: printOrder.includes(i) ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                    borderColor: printOrder.includes(i) ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {n.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-28">
          <div className="text-[10px] text-muted-foreground mb-2">Log</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4 text-xs font-mono text-foreground/90 min-h-24">
            {(logs ?? []).slice(-8).map((entry, index) => (
              <div key={`${index}-${entry}`}>{entry}</div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2 self-center">Reset</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {label && <div className="text-xs text-muted-foreground mb-1 font-mono">{label}</div>}
      <svg viewBox="0 0 400 320" className="w-full max-w-md">
        {/* Edges */}
        {nodes.map(n => {
          const children = [n.left, n.right].filter((c): c is number => c !== null && c < nodes.length);
          return children.map(c => (
            <line key={`${n.id}-${c}`}
              x1={n.x} y1={n.y} x2={nodes[c].x} y2={nodes[c].y}
              stroke={highlightSet.has(n.id) && highlightSet.has(c) ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 25%)"}
              strokeWidth={highlightSet.has(n.id) && highlightSet.has(c) ? 2.5 : 1.5}
              opacity={highlightSet.has(n.id) && highlightSet.has(c) ? 1 : 0.4}
            />
          ));
        })}
        {/* Nodes */}
        {nodes.map(n => {
          const isHighlighted = highlightSet.has(n.id);
          const isFound = found === n.id;
          return (
            <g key={n.id}>
              {isFound && (
                <circle cx={n.x} cy={n.y} r={22} fill="none"
                  stroke="hsl(45, 90%, 55%)" strokeWidth={2.5} opacity={0.6} />
              )}
              <circle cx={n.x} cy={n.y} r={16}
                fill={isFound ? "hsl(45, 90%, 55%)" : isHighlighted ? "hsl(145, 60%, 40%)" : "hsl(150, 20%, 12%)"}
                stroke={isHighlighted ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 30%)"}
                strokeWidth={isHighlighted ? 2 : 1}
              />
              <text x={n.x} y={n.y + 4}
                fill={isFound ? "hsl(150, 30%, 4%)" : isHighlighted ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 80%)"}
                fontSize="11" textAnchor="middle" fontWeight={600}
              >
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-1">Reset</button>
    </div>
  );
}
