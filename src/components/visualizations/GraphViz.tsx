import { useState, useEffect, useRef, useMemo } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
  onCodeMarkerChange?: (marker: string | null) => void;
}

interface Node { id: number; x: number; y: number; label?: string; dist?: number; }
interface Edge { from: number; to: number; weight: number; }
interface GStep {
  visited: number[];
  current: number;
  activeEdges: string[];
  nodeLabels?: Record<number, string>;
  distanceLabels?: Record<number, string>;
  codeMarker?: string | null;
  logs?: string[];
  colors?: number[];
  pageRanks?: number[];
  outDegrees?: number[];
  incomingMatrix?: number[][];
  /** Tarjan SCC tracers (algorithm-visualizer style) */
  tarjanDisc?: number[];
  tarjanLow?: number[];
  tarjanOnStack?: boolean[];
  tarjanStack?: number[];
}

function buildGraph(algorithmName: string): { nodes: Node[]; edges: Edge[] } {
  if (algorithmName.includes("Depth-First")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 42 },
      { id: 1, x: 255, y: 75 },
      { id: 2, x: 275, y: 150 },
      { id: 3, x: 255, y: 235 },
      { id: 4, x: 200, y: 270 },
      { id: 5, x: 145, y: 205 },
      { id: 6, x: 125, y: 150 },
      { id: 7, x: 145, y: 75 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 3, weight: 1 },
      { from: 3, to: 7, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 6, weight: 1 },
      { from: 6, to: 2, weight: 1 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Breadth-First")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 42 },
      { id: 1, x: 305, y: 120 },
      { id: 2, x: 255, y: 250 },
      { id: 3, x: 110, y: 250 },
      { id: 4, x: 60, y: 120 },
    ];
    const edges: Edge[] = [
      { from: 4, to: 0, weight: 3 },
      { from: 0, to: 1, weight: 7 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 9 },
      { from: 3, to: 4, weight: 8 },
      { from: 4, to: 1, weight: 8 },
      { from: 0, to: 2, weight: 8 },
      { from: 0, to: 3, weight: 8 },
      { from: 4, to: 2, weight: 7 },
      { from: 3, to: 1, weight: 7 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Bipartite")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 42 },
      { id: 1, x: 285, y: 120 },
      { id: 2, x: 255, y: 235 },
      { id: 3, x: 145, y: 235 },
      { id: 4, x: 115, y: 120 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 0, weight: 1 },
      { from: 0, to: 4, weight: 1 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Depth-Limited")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 40 },
      { id: 1, x: 160, y: 110 },
      { id: 2, x: 240, y: 110 },
      { id: 3, x: 135, y: 185 },
      { id: 4, x: 185, y: 185 },
      { id: 5, x: 225, y: 185 },
      { id: 6, x: 255, y: 185 },
      { id: 7, x: 120, y: 260 },
      { id: 8, x: 145, y: 260 },
      { id: 9, x: 175, y: 260 },
      { id: 10, x: 200, y: 260 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 1, to: 4, weight: 1 },
      { from: 2, to: 5, weight: 1 },
      { from: 2, to: 6, weight: 1 },
      { from: 3, to: 7, weight: 1 },
      { from: 3, to: 8, weight: 1 },
      { from: 4, to: 9, weight: 1 },
      { from: 4, to: 10, weight: 1 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("PageRank")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 48 },
      { id: 1, x: 292, y: 118 },
      { id: 2, x: 260, y: 228 },
      { id: 3, x: 140, y: 228 },
      { id: 4, x: 108, y: 118 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 0, to: 3, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 2, to: 4, weight: 1 },
      { from: 3, to: 0, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 0, weight: 1 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Topological")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 45 },
      { id: 1, x: 300, y: 120 },
      { id: 2, x: 300, y: 235 },
      { id: 3, x: 200, y: 305 },
      { id: 4, x: 95, y: 235 },
      { id: 5, x: 95, y: 120 },
    ];
    const edges: Edge[] = [
      { from: 5, to: 0, weight: 1 },
      { from: 5, to: 1, weight: 1 },
      { from: 4, to: 0, weight: 1 },
      { from: 4, to: 3, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Tarjan") || algorithmName.includes("Strongly Connected")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 55 },
      { id: 1, x: 310, y: 115 },
      { id: 2, x: 285, y: 210 },
      { id: 3, x: 115, y: 210 },
      { id: 4, x: 90, y: 115 },
      { id: 5, x: 200, y: 285 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 0, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
      { from: 5, to: 3, weight: 1 },
    ];
    return { nodes, edges };
  }

  /**
   * Bellman-Ford reference graph (algorithm-visualizer style):
   * 0 top, 4 left, 1 right, 2 bottom-right, 3 bottom-left.
   * 2→3 links the lower row so every node is reachable from source 4.
   */
  if (algorithmName.includes("Bellman-Ford")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 52 },
      { id: 1, x: 312, y: 168 },
      { id: 2, x: 268, y: 268 },
      { id: 3, x: 132, y: 268 },
      { id: 4, x: 88, y: 168 },
    ];
    const edges: Edge[] = [
      { from: 4, to: 0, weight: 2 },
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 1 },
      { from: 4, to: 1, weight: 4 },
      { from: 4, to: 2, weight: -1 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Dijkstra")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 40 },
      { id: 1, x: 300, y: 110 },
      { id: 2, x: 260, y: 220 },
      { id: 3, x: 140, y: 220 },
      { id: 4, x: 100, y: 110 },
    ];
    const edges: Edge[] = [
      { from: 3, to: 0, weight: 3 },
      { from: 3, to: 1, weight: 1 },
      { from: 3, to: 2, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 0, to: 1, weight: 9 },
      { from: 0, to: 2, weight: 6 },
      { from: 0, to: 4, weight: 4 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 4, weight: 1 },
      { from: 2, to: 4, weight: 2 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Kruskal")) {
    const nodes: Node[] = [
      { id: 0, x: 200, y: 40 },
      { id: 1, x: 300, y: 110 },
      { id: 2, x: 260, y: 220 },
      { id: 3, x: 140, y: 220 },
      { id: 4, x: 100, y: 110 },
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 8 },
      { from: 1, to: 2, weight: 5 },
      { from: 2, to: 3, weight: 9 },
      { from: 3, to: 4, weight: 5 },
      { from: 4, to: 0, weight: 8 },
      { from: 0, to: 2, weight: 4 },
      { from: 0, to: 3, weight: 6 },
      { from: 1, to: 4, weight: 3 },
      { from: 1, to: 3, weight: 3 },
      { from: 2, to: 4, weight: 3 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Prim")) {
    const n = 10;
    const nodes: Node[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ id: i, x: 200 + Math.cos(angle) * 120, y: 170 + Math.sin(angle) * 120 });
    }
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 5 }, { from: 0, to: 2, weight: 2 }, { from: 0, to: 7, weight: 6 }, { from: 0, to: 9, weight: 2 },
      { from: 1, to: 2, weight: 7 }, { from: 1, to: 5, weight: 8 }, { from: 1, to: 9, weight: 5 },
      { from: 2, to: 3, weight: 4 }, { from: 2, to: 5, weight: 4 }, { from: 2, to: 9, weight: 9 },
      { from: 3, to: 4, weight: 5 }, { from: 3, to: 8, weight: 6 },
      { from: 4, to: 5, weight: 3 }, { from: 4, to: 8, weight: 8 },
      { from: 5, to: 6, weight: 4 }, { from: 5, to: 7, weight: 2 }, { from: 5, to: 9, weight: 7 },
      { from: 6, to: 7, weight: 3 }, { from: 6, to: 8, weight: 5 },
      { from: 7, to: 8, weight: 7 }, { from: 7, to: 9, weight: 8 },
      { from: 8, to: 9, weight: 9 },
    ];
    return { nodes, edges };
  }

  if (algorithmName.includes("Cycle Detection")) {
    const nodes: Node[] = [
      { id: 0, x: 220, y: 50 },
      { id: 1, x: 300, y: 80 },
      { id: 2, x: 330, y: 160 },
      { id: 3, x: 280, y: 220 },
      { id: 4, x: 200, y: 220 },
      { id: 5, x: 150, y: 150 },
      { id: 6, x: 170, y: 80 }
    ];
    const edges: Edge[] = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
      { from: 5, to: 6, weight: 1 },
      { from: 6, to: 2, weight: 1 }
    ];
    return { nodes, edges };
  }

  const count = 8;
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ id: i, x: 200 + Math.cos(angle) * 120, y: 170 + Math.sin(angle) * 120 });
  }
  const edges: Edge[] = [
    { from: 0, to: 1, weight: 4 }, { from: 0, to: 7, weight: 8 },
    { from: 1, to: 2, weight: 8 }, { from: 1, to: 7, weight: 11 },
    { from: 2, to: 3, weight: 7 }, { from: 2, to: 5, weight: 4 },
    { from: 3, to: 4, weight: 9 }, { from: 3, to: 5, weight: 14 },
    { from: 4, to: 5, weight: 10 }, { from: 5, to: 6, weight: 2 },
    { from: 6, to: 7, weight: 1 }, { from: 6, to: 2, weight: 6 },
  ];
  return { nodes, edges };
}

function edgeKey(a: number, b: number) { return `${Math.min(a, b)}-${Math.max(a, b)}`; }

function directedEdgeKey(from: number, to: number) {
  return `${from}-${to}`;
}

/** Matches algorithm-visualizer console output for ∞ distances. */
const BF_LOG_INF = 2147483647;

function bfWeightsLog(dist: number[]): string {
  return dist.map((d) => (d === Infinity ? BF_LOG_INF : d)).join(", ");
}

function bfsSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const adj: number[][] = Array.from({ length: nodes.length }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const steps: GStep[] = [];
  const vis = new Set<number>();
  const queue = [4];
  const dist = Array(nodes.length).fill(Number.POSITIVE_INFINITY);
  vis.add(4);
  dist[4] = 0;

  const distanceLabels = (): Record<number, string> => {
    const result: Record<number, string> = {};
    for (let i = 0; i < nodes.length; i++) {
      if (dist[i] !== Number.POSITIVE_INFINITY) result[i] = String(dist[i]);
    }
    return result;
  };

  steps.push({
    visited: [4],
    current: 4,
    activeEdges: [],
    codeMarker: "init-queue",
    logs: ["Start BFS from node 4.", "Enqueue 4."],
    distanceLabels: distanceLabels(),
  });
  while (queue.length) {
    const n = queue.shift()!;
    steps.push({
      visited: [...vis],
      current: n,
      activeEdges: steps.length > 0 ? [...steps[steps.length - 1].activeEdges] : [],
      codeMarker: "dequeue-node",
      logs: [`Dequeue ${n}.`],
      distanceLabels: distanceLabels(),
    });
    for (const nb of adj[n]) {
      steps.push({
        visited: [...vis],
        current: nb,
        activeEdges: [...(steps[steps.length - 1]?.activeEdges || []), edgeKey(n, nb)],
        codeMarker: "check-neighbor",
        logs: [`Inspect edge ${n} -> ${nb}.`],
        distanceLabels: distanceLabels(),
      });
      if (!vis.has(nb)) {
        vis.add(nb);
        queue.push(nb);
        dist[nb] = dist[n] + 1;
        steps.push({
          visited: [...vis],
          current: nb,
          activeEdges: [...(steps[steps.length - 1]?.activeEdges || []), edgeKey(n, nb)],
          codeMarker: "visit-neighbor",
          logs: [`Visit ${nb} from ${n}.`, `Set distance of ${nb} to ${dist[nb]}.`],
          distanceLabels: distanceLabels(),
        });
        steps.push({
          visited: [...vis],
          current: nb,
          activeEdges: [...(steps[steps.length - 1]?.activeEdges || [])],
          codeMarker: "enqueue-neighbor",
          logs: [`Enqueue ${nb}.`],
          distanceLabels: distanceLabels(),
        });
      }
    }
  }
  steps.push({
    visited: [...vis],
    current: 0,
    activeEdges: [...(steps[steps.length - 1]?.activeEdges || [])],
    codeMarker: "return-order",
    logs: [`BFS complete. Distance from 4 to 0 is ${dist[0]}.`],
    distanceLabels: distanceLabels(),
  });
  return steps;
}

function dfsSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const adj: number[][] = Array.from({ length: nodes.length }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const steps: GStep[] = [];
  const vis = new Set<number>();
  function visit(n: number, parent: number | null) {
    vis.add(n);
    steps.push({
      visited: [...vis],
      current: n,
      activeEdges: steps.length > 0 ? [...steps[steps.length - 1].activeEdges] : [],
      codeMarker: "pop-node",
      logs: [`-> ${n}`],
    });
    steps.push({
      visited: [...vis],
      current: n,
      activeEdges: steps.length > 0 ? [...steps[steps.length - 1].activeEdges] : [],
      codeMarker: "mark-visited",
      logs: [`Mark ${n} as visited.`],
    });
    for (const nb of adj[n]) {
      steps.push({
        visited: [...vis],
        current: nb,
        activeEdges: [...(steps[steps.length - 1]?.activeEdges || []), edgeKey(n, nb)],
        codeMarker: "check-neighbor",
        logs: [`Inspect neighbor ${nb} from ${n}.`],
      });
      if (!vis.has(nb)) {
        const ae = [...(steps[steps.length - 1]?.activeEdges || []), edgeKey(n, nb)];
        steps.push({
          visited: [...vis, nb],
          current: nb,
          activeEdges: ae,
          codeMarker: "push-neighbor",
          logs: [`${n} -> ${nb}`],
        });
        visit(nb, n);
      }
    }
    if (parent !== null) {
      steps.push({
        visited: [...vis],
        current: parent,
        activeEdges: [...(steps[steps.length - 1]?.activeEdges || [])],
        codeMarker: "return-visited",
        logs: [`Backtrack to ${parent}.`],
      });
    }
  }
  visit(0, null);
  const connected = nodes.every((node) => vis.has(node.id));
  steps.push({
    visited: [...vis],
    current: 0,
    activeEdges: [...(steps[steps.length - 1]?.activeEdges || [])],
    codeMarker: "return-visited",
    logs: [connected ? "The graph is CONNECTED" : "The graph is NOT CONNECTED"],
  });
  return steps;
}

function depthLimitedSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const adj: number[][] = Array.from({ length: nodes.length }, () => []);
  edges.forEach((e) => { adj[e.from].push(e.to); });
  const steps: GStep[] = [];
  const visited = new Set<number>();
  const activeEdges: string[] = [];
  const target = 10;
  const limit = 3;

  function visit(node: number, depth: number, trail: string[]): boolean {
    steps.push({ visited: [...visited], current: node, activeEdges: [...activeEdges], codeMarker: "check-target", logs: [...trail, `-> ${node}`] });
    if (node === target) return true;

    steps.push({ visited: [...visited], current: node, activeEdges: [...activeEdges], codeMarker: "check-limit", logs: [...trail, `depth ${depth}/${limit}`] });
    if (depth >= limit) {
      steps.push({ visited: [...visited], current: node, activeEdges: [...activeEdges], codeMarker: "return-false", logs: [...trail, `cut off at ${node}`] });
      return false;
    }

    visited.add(node);
    steps.push({ visited: [...visited], current: node, activeEdges: [...activeEdges], codeMarker: "mark-visited", logs: [...trail, `visit ${node}`] });

    for (const next of adj[node]) {
      if (!visited.has(next)) {
        activeEdges.push(edgeKey(node, next));
        steps.push({ visited: [...visited], current: next, activeEdges: [...activeEdges], codeMarker: "recurse", logs: [...trail, `-> ${node}`, `explore ${next}`] });
        if (visit(next, depth + 1, [...trail, `-> ${node}`])) return true;
        activeEdges.pop();
      }
    }

    steps.push({ visited: [...visited], current: node, activeEdges: [...activeEdges], codeMarker: "return-false", logs: [...trail, `backtrack from ${node}`] });
    return false;
  }

  visit(0, 0, []);
  return steps;
}

function dijkstraSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push({ to: e.to, w: e.weight }); adj[e.to].push({ to: e.from, w: e.weight }); });
  const dist = Array(n).fill(Infinity);
  const vis = new Set<number>();
  const steps: GStep[] = [];
  const logs: string[] = [];
  
  const SRC = 3;
  dist[SRC] = 0;

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!vis.has(v) && (u === -1 || dist[v] < dist[u])) u = v;
    if (u === -1 || dist[u] === Infinity) break;
    vis.add(u);
    
    const labels: Record<number, string> = {};
    for (let v = 0; v < n; v++) labels[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
    
    steps.push({ visited: [...vis], current: u, activeEdges: steps.length > 0 ? [...steps[steps.length - 1].activeEdges] : [], nodeLabels: labels, logs: [...logs] });
    
    for (const { to, w } of adj[u]) {
      if (!vis.has(to)) {
        logs.push(`-> ${to}`);
        steps.push({ visited: [...vis], current: u, activeEdges: [...(steps[steps.length - 1]?.activeEdges || []), edgeKey(u, to)], nodeLabels: labels, logs: [...logs] });
        if (dist[u] + w < dist[to]) {
          dist[to] = dist[u] + w;
          logs.push(`<- ${dist[to]}`);
          const labels2: Record<number, string> = {};
          for (let v = 0; v < n; v++) labels2[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
          steps.push({ visited: [...vis], current: to, activeEdges: [...(steps.length > 0 ? steps[steps.length - 1].activeEdges : []), edgeKey(u, to)], nodeLabels: labels2, logs: [...logs] });
        }
      }
    }
  }
  logs.push(`The shortest path from ${SRC} to 0 is ${dist[0]}`);
  
  const finalLabels: Record<number, string> = {};
  for (let v = 0; v < n; v++) finalLabels[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
  steps.push({ visited: [...vis], current: -1, activeEdges: [], nodeLabels: finalLabels, logs: [...logs] });
  
  return steps;
}

function kruskalSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: nodes.length }, (_, i) => i);
  function find(x: number): number { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  const steps: GStep[] = [];
  const mstEdges: string[] = [];
  const connected = new Set<number>();
  let wsum = 0;
  const logs: string[] = [];
  
  for (const e of sorted) {
    const pu = find(e.from), pv = find(e.to);
    steps.push({ visited: [...connected], current: e.from, activeEdges: [...mstEdges, edgeKey(e.from, e.to)], logs: [...logs] });
    if (pu !== pv) {
      parent[pu] = pv;
      wsum += e.weight;
      mstEdges.push(edgeKey(e.from, e.to));
      connected.add(e.from);
      connected.add(e.to);
      steps.push({ visited: [...connected], current: e.to, activeEdges: [...mstEdges], logs: [...logs] });
    }
  }
  
  logs.push(`The sum of all edges is: ${wsum}`);
  steps.push({ visited: [...connected], current: -1, activeEdges: [...mstEdges], logs: [...logs] });
  return steps;
}

function primSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push({ to: e.to, w: e.weight }); adj[e.to].push({ to: e.from, w: e.weight }); });
  const inMST = new Set<number>();
  const steps: GStep[] = [];
  const mstEdges: string[] = [];
  let wsum = 0;
  const logs: string[] = [];

  inMST.add(0);
  steps.push({ visited: [...inMST], current: 0, activeEdges: [...mstEdges], logs: [...logs] });

  for (let k = 0; k < n - 1; k++) {
    let minW = Infinity;
    let minU = -1;
    let minV = -1;

    for (let u = 0; u < n; u++) {
      if (inMST.has(u)) {
        for (const edge of adj[u]) {
          if (!inMST.has(edge.to)) {
            logs.push(`${u} -> ${edge.to}`);
            steps.push({ visited: [...inMST], current: edge.to, activeEdges: [...mstEdges, edgeKey(u, edge.to)], logs: [...logs] });
            logs.push(`${u} <- ${edge.to}`);
            if (edge.w < minW) {
              minW = edge.w;
              minU = u;
              minV = edge.to;
            }
          }
        }
      }
    }

    if (minV !== -1) {
      wsum += minW;
      inMST.add(minV);
      mstEdges.push(edgeKey(minU, minV));
      steps.push({ visited: [...inMST], current: minV, activeEdges: [...mstEdges], logs: [...logs] });
    } else {
      break;
    }
  }

  logs.push(`The sum of all edges is: ${wsum}`);
  steps.push({ visited: [...inMST], current: -1, activeEdges: [...mstEdges], logs: [...logs] });
  return steps;
}

function bellmanFordSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const SRC = 4;
  const dist = Array(n).fill(Infinity);
  dist[SRC] = 0;
  const steps: GStep[] = [];
  const logs: string[] = [];

  const labelsFromDist = (): Record<number, string> => {
    const labels: Record<number, string> = {};
    for (let v = 0; v < n; v++) labels[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
    return labels;
  };

  const push = (current: number, active: string[]) => {
    steps.push({
      visited: dist.map((d, i) => (d < Infinity ? i : -1)).filter((x) => x >= 0),
      current,
      activeEdges: active,
      nodeLabels: labelsFromDist(),
      logs: [...logs],
    });
  };

  logs.push(`source = ${SRC}`);
  logs.push(`initial weights: [${bfWeightsLog(dist)}]`);
  push(SRC, []);

  for (let k = 0; k < n - 1; k++) {
    logs.push(`pass ${k + 1} / ${n - 1}`);
    for (const e of edges) {
      const { from: u, to: v, weight: w } = e;
      const ek = directedEdgeKey(u, v);
      logs.push(`${u} -> ${v} (w=${w})`);
      push(v, [ek]);
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        logs.push(`relax: dist[${v}] = ${dist[v]}`);
        logs.push(`updated weights: [${bfWeightsLog(dist)}]`);
        push(v, [ek]);
      }
    }
  }

  logs.push("checking for negative cycle");
  push(SRC, []);
  let hasNegCycle = false;
  for (const e of edges) {
    const { from: u, to: v, weight: w } = e;
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      hasNegCycle = true;
      break;
    }
  }

  if (hasNegCycle) {
    logs.push("Negative cycle detected.");
  } else {
    logs.push(`No cycles detected. Final weights for the source ${SRC} are: [${bfWeightsLog(dist)}]`);
    for (let i = 0; i < n; i++) {
      if (dist[i] === Infinity) logs.push(`there is no path from ${SRC} to ${i}`);
    }
  }
  push(SRC, []);

  return steps;
}

function topologicalSortSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);
  edges.forEach(e => {
    adj[e.from].push(e.to);
    indegree[e.to]++;
  });
  const steps: GStep[] = [];
  const queue: number[] = [];
  const visited: number[] = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  const ae: string[] = [];
  const logBase = [`In-degrees are: [${indegree.join(",")}]`];

  edges.forEach((e) => {
    steps.push({
      visited: [],
      current: e.from,
      activeEdges: [],
      codeMarker: "count-indegree",
      logs: [...logBase, `${e.from} -> ${e.to}`],
    });
    steps.push({
      visited: [],
      current: e.to,
      activeEdges: [],
      codeMarker: "increment-indegree",
      logs: [...logBase, `Incremented in-degree of ${e.to}`],
    });
  });

  for (const q of queue) {
    steps.push({
      visited: [],
      current: q,
      activeEdges: [],
      codeMarker: "enqueue-zero",
      logs: [...logBase, `Queue state: [ ${queue.join(" ")} ]`, `-> ${q}`],
    });
  }

  while (queue.length) {
    steps.push({
      visited: [...visited],
      current: queue[0],
      activeEdges: [...ae],
      codeMarker: "check-queue",
      logs: [`Queue state: [ ${queue.join(" ")} ]`],
    });
    const u = queue.shift()!;
    steps.push({
      visited: [...visited],
      current: u,
      activeEdges: [...ae],
      codeMarker: "shift-queue",
      logs: [`Queue state: [ ${[u, ...queue].join(" ")} ]`, `-> ${u}`],
    });
    visited.push(u);
    steps.push({ visited: [...visited], current: u, activeEdges: [...ae] });
    for (const v of adj[u]) {
      indegree[v]--;
      ae.push(edgeKey(u, v));
      steps.push({
        visited: [...visited],
        current: v,
        activeEdges: [...ae],
        codeMarker: "decrement-indegree",
        logs: [`${v} has an incoming edge from ${u}. Decrementing ${v}'s in-degree by 1.`, `In-degrees are: [${indegree.join(",")}]`],
      });
      if (indegree[v] === 0) {
        queue.push(v);
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae],
          codeMarker: "enqueue-neighbor",
          logs: [`${v}'s in-degree is now 0. Enqueuing ${v}`, `Queue state: [ ${queue.join(" ")} ]`],
        });
      }
    }
  }
  return steps;
}

function hamiltonianSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const steps: GStep[] = [];
  const path: number[] = [0];
  const visited = new Set<number>([0]);
  const ae: string[] = [];

  function solve(): boolean {
    if (path.length === n) {
      if (adj[path[path.length - 1]].includes(path[0])) {
        ae.push(edgeKey(path[path.length - 1], path[0]));
        steps.push({ visited: [...visited], current: path[0], activeEdges: [...ae], codeMarker: "check-cycle" });
        return true;
      }
      return false;
    }
    const cur = path[path.length - 1];
    for (const nb of adj[cur]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        path.push(nb);
        ae.push(edgeKey(cur, nb));
        steps.push({ visited: [...visited], current: nb, activeEdges: [...ae], codeMarker: "place-node" });
        if (steps.length > 200) return true;
        steps.push({ visited: [...visited], current: nb, activeEdges: [...ae], codeMarker: "recurse" });
        if (solve()) return true;
        ae.pop();
        path.pop();
        visited.delete(nb);
        steps.push({ visited: [...visited], current: cur, activeEdges: [...ae], nodeLabels: { [nb]: "✗" } });
      }
    }
    return false;
  }
  steps.push({ visited: [0], current: 0, activeEdges: [], codeMarker: "init-path" });
  solve();
  steps.push({ visited: [...visited], current: path[path.length - 1] ?? 0, activeEdges: [...ae], codeMarker: "return-result" });
  return steps;
}

function tarjanSCCSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); });
  const disc = Array(n).fill(-1);
  const low = Array(n).fill(-1);
  const onStack = Array(n).fill(false);
  const stack: number[] = [];
  let timer = 0;
  const steps: GStep[] = [];
  const visited: number[] = [];
  const ae: string[] = [];
  const logs: string[] = [];
  let sccCount = 0;

  const labelsFromDiscLow = (): Record<number, string> => {
    const labels: Record<number, string> = {};
    for (let i = 0; i < n; i++) {
      if (disc[i] >= 0) labels[i] = `${disc[i]}/${low[i]}`;
    }
    return labels;
  };

  const record = (u: number, labelOverride?: Record<number, string>) => {
    steps.push({
      visited: [...visited],
      current: u,
      activeEdges: [...ae],
      nodeLabels: labelOverride !== undefined ? labelOverride : labelsFromDiscLow(),
      tarjanDisc: [...disc],
      tarjanLow: [...low],
      tarjanOnStack: onStack.map(Boolean),
      tarjanStack: [...stack],
      logs: [...logs],
    });
  };

  logs.push("Initialize disc[i] = low[i] = -1; stack empty; stackMember[i] = false.");
  record(-1, {});

  function dfs(u: number) {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;
    visited.push(u);
    logs.push(`Visit ${u}: disc[${u}] = low[${u}] = ${disc[u]}, push ${u} on stack.`);
    record(u);

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        ae.push(directedEdgeKey(u, v));
        logs.push(`Edge ${u} → ${v}: tree edge, DFS into ${v}.`);
        record(u);
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        logs.push(`Return from ${v}: low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.`);
        record(u);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
        logs.push(`Edge ${u} → ${v}: ${v} on stack → low[${u}] = min(low[${u}], disc[${v}]) = ${low[u]}.`);
        record(u);
      }
    }

    if (low[u] === disc[u]) {
      sccCount++;
      logs.push(`low[${u}] == disc[${u}]: pop strongly connected component #${sccCount}.`);
      const labels2: Record<number, string> = { ...labelsFromDiscLow() };
      while (true) {
        const v = stack.pop()!;
        onStack[v] = false;
        labels2[v] = `SCC${sccCount}`;
        if (v === u) break;
      }
      record(u, labels2);
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) {
      logs.push(`Start DFS from source node ${i}.`);
      dfs(i);
    }
  }
  logs.push("Tarjan finished — all SCCs extracted.");
  const tail = steps[steps.length - 1];
  if (tail) {
    steps.push({
      visited: [...tail.visited],
      current: tail.current,
      activeEdges: [...tail.activeEdges],
      nodeLabels: tail.nodeLabels ? { ...tail.nodeLabels } : undefined,
      tarjanDisc: [...(tail.tarjanDisc ?? [])],
      tarjanLow: [...(tail.tarjanLow ?? [])],
      tarjanOnStack: [...(tail.tarjanOnStack ?? [])],
      tarjanStack: [...(tail.tarjanStack ?? [])],
      logs: [...logs],
    });
  }
  return steps;
}

function bridgeFindingSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const disc = Array(n).fill(-1);
  const low = Array(n).fill(-1);
  let timer = 0;
  const steps: GStep[] = [];
  const visited: number[] = [];
  const ae: string[] = [];
  const bridgeEdges: string[] = [];

  function dfs(u: number, parent: number) {
    disc[u] = low[u] = timer++;
    visited.push(u);
    const labels: Record<number, string> = {};
    for (let i = 0; i < n; i++) if (disc[i] >= 0) labels[i] = `${disc[i]}/${low[i]}`;
    steps.push({
      visited: [...visited],
      current: u,
      activeEdges: [...ae, ...bridgeEdges],
      nodeLabels: labels,
      codeMarker: "visit-node",
      logs: [`Visit node ${u}.`, `disc[${u}] = low[${u}] = ${disc[u]}`],
    });

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        ae.push(edgeKey(u, v));
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae, ...bridgeEdges],
          nodeLabels: labels,
          codeMarker: "tree-edge",
          logs: [`Traverse tree edge ${u}-${v}.`],
        });
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        const labelsAfter: Record<number, string> = {};
        for (let i = 0; i < n; i++) if (disc[i] >= 0) labelsAfter[i] = `${disc[i]}/${low[i]}`;
        steps.push({
          visited: [...visited],
          current: u,
          activeEdges: [...ae, ...bridgeEdges],
          nodeLabels: labelsAfter,
          codeMarker: "update-low",
          logs: [`Update low[${u}] using low[${v}].`, `low[${u}] = ${low[u]}`],
        });
        if (low[v] > disc[u]) {
          bridgeEdges.push(edgeKey(u, v));
          const labels2: Record<number, string> = {};
          for (let i = 0; i < n; i++) if (disc[i] >= 0) labels2[i] = `${disc[i]}/${low[i]}`;
          labels2[u] = `BR!`;
          steps.push({
            visited: [...visited],
            current: u,
            activeEdges: [...ae, ...bridgeEdges],
            nodeLabels: labels2,
            codeMarker: "bridge-found",
            logs: [`Bridge found: ${u}-${v}.`],
          });
        }
      } else if (v !== parent) {
        low[u] = Math.min(low[u], disc[v]);
        const labelsBack: Record<number, string> = {};
        for (let i = 0; i < n; i++) if (disc[i] >= 0) labelsBack[i] = `${disc[i]}/${low[i]}`;
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae, ...bridgeEdges, edgeKey(u, v)],
          nodeLabels: labelsBack,
          codeMarker: "back-edge",
          logs: [`Back edge ${u}-${v} lowers low[${u}] to ${low[u]}.`],
        });
      }
    }
  }

  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i, -1);
  steps.push({
    visited: [...visited],
    current: visited[visited.length - 1] ?? 0,
    activeEdges: [...ae, ...bridgeEdges],
    codeMarker: "return-result",
    logs: bridgeEdges.length
      ? [`Finished search. Bridges: ${bridgeEdges.join(", ")}.`]
      : ["Finished search. No bridges found."],
  });
  return steps;
}

function bipartitenessSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const color = Array(n).fill(-1);
  const steps: GStep[] = [];
  const queue = [0];
  color[0] = 0;
  const visited: number[] = [0];
  const ae: string[] = [];
  const labels = (): Record<number, string> => {
    const result: Record<number, string> = {};
    for (let i = 0; i < n; i++) result[i] = String(i);
    return result;
  };

  steps.push({
    visited: [],
    current: 0,
    activeEdges: [],
    codeMarker: "init-colors",
    logs: ["Initialize all colors to -1."],
    colors: [...color],
    nodeLabels: labels(),
  });
  steps.push({
    visited: [0],
    current: 0,
    activeEdges: [],
    codeMarker: "color-start",
    logs: ["Assign color 0 to start node 0.", "Enqueue 0."],
    colors: [...color],
    nodeLabels: labels(),
  });

  while (queue.length) {
    const u = queue.shift()!;
    steps.push({
      visited: [...visited],
      current: u,
      activeEdges: [...ae],
      codeMarker: "dequeue-node",
      logs: [`Dequeue ${u} and scan its neighbors.`],
      colors: [...color],
      nodeLabels: labels(),
    });
    for (const v of adj[u]) {
      steps.push({
        visited: [...visited],
        current: v,
        activeEdges: [...ae, edgeKey(u, v)],
        codeMarker: "check-neighbor",
        logs: [`Check whether ${u} is connected to ${v}.`],
        colors: [...color],
        nodeLabels: labels(),
      });
      if (color[v] === -1) {
        color[v] = 1 - color[u];
        queue.push(v);
        visited.push(v);
        ae.push(edgeKey(u, v));
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae],
          codeMarker: "color-neighbor",
          logs: [`Color node ${v} with ${color[v]}.`],
          colors: [...color],
          nodeLabels: labels(),
        });
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae],
          codeMarker: "enqueue-neighbor",
          logs: [`Enqueue ${v}.`],
          colors: [...color],
          nodeLabels: labels(),
        });
      } else if (color[v] === color[u]) {
        steps.push({
          visited: [...visited],
          current: v,
          activeEdges: [...ae, edgeKey(u, v)],
          codeMarker: "detect-conflict",
          logs: [`Conflict found between ${u} and ${v}.`, "Graph is not bipartite."],
          colors: [...color],
          nodeLabels: labels(),
        });
        return steps;
      }
    }
  }
  steps.push({
    visited: [...visited],
    current: visited[visited.length - 1] ?? 0,
    activeEdges: [...ae],
    codeMarker: "return-true",
    logs: ["All adjacent nodes have opposite colors.", "Graph is bipartite."],
    colors: [...color],
    nodeLabels: labels(),
  });
  return steps;
}

function pageRankSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); });
  const outDeg = adj.map((a) => a.length);
  const incomingMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  for (let i = 0; i < n; i++) {
    for (const j of adj[i]) incomingMatrix[i][j] = i;
  }
  const d = 0.85;
  let pr = Array(n).fill(1 / n);
  const steps: GStep[] = [];
  const allDirected = edges.map((e) => directedEdgeKey(e.from, e.to));

  const snapshot = (
    current: number,
    extraLogs: string[],
    codeMarker: string,
  ): void => {
    steps.push({
      visited: Array.from({ length: n }, (_, i) => i),
      current,
      activeEdges: allDirected,
      codeMarker,
      pageRanks: [...pr],
      outDegrees: [...outDeg],
      incomingMatrix: incomingMatrix.map((row) => [...row]),
      logs: extraLogs,
    });
  };

  snapshot(0, [
    "Calculate Outgoing Edge Count for each Node.",
    `Outgoing counts: [${outDeg.join(", ")}].`,
    "Determine incoming nodes for each node (matrix: row i → column j shows source i if link i→j, else -1).",
    `Initialized all Page ranks to ${(1 / n).toFixed(4)} (uniform 1/N).`,
    "Begin execution of PageRank.",
    "PR(X) = (1 - d)/N + d × Σ(PR(I) / Out(I)) over pages I that link to X.  (d = 0.85)",
  ], "init-pr");

  const iters = 12;
  for (let iter = 0; iter < iters; iter++) {
    const newPR = Array(n).fill((1 - d) / n);
    for (let u = 0; u < n; u++) {
      const od = Math.max(1, outDeg[u]);
      for (const v of adj[u]) newPR[v] += (d * pr[u]) / od;
    }
    pr = newPR;
    const maxIdx = pr.reduce((bi, v, i) => (v > pr[bi] ? i : bi), 0);
    snapshot(
      maxIdx,
      [
        `Iteration ${iter + 1} / ${iters}: redistribute rank along outgoing links.`,
        `Highest rank: node ${maxIdx} → ${pr[maxIdx].toFixed(4)}.`,
      ],
      iter === iters - 1 ? "complete-pr" : "iterate-pr",
    );
  }
  return steps;
}

function stableMatchingSteps(nodes: Node[], edges: Edge[]): GStep[] {
  // Simplified: show proposal/acceptance on the graph
  const steps: GStep[] = [];
  const visited: number[] = [];
  const ae: string[] = [];
  const n = Math.min(nodes.length, 8);
  const labels: Record<number, string> = {};

  // Simulate proposals
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const proposer = i;
    const target = Math.floor(n / 2) + i;
    visited.push(proposer);
    labels[proposer] = `P${i}`;
    steps.push({ visited: [...visited], current: proposer, activeEdges: [...ae], nodeLabels: { ...labels } });

    visited.push(target);
    labels[target] = `R${i}`;
    ae.push(edgeKey(proposer, target));
    steps.push({ visited: [...visited], current: target, activeEdges: [...ae], nodeLabels: { ...labels } });
  }
  return steps;
}

function cycleDetectionSteps(nodes: Node[], _edges: Edge[]): GStep[] {
  const next: Record<number, number> = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 2
  };
  
  const steps: GStep[] = [];
  const logs: string[] = [];
  
  let slow = 0;
  let fast = 0;
  
  const pushStep = (s: number, f: number) => {
    const labels: Record<number, string> = {};
    if (s === f) labels[s] = "S, F";
    else { labels[s] = "S"; labels[f] = "F"; }
    steps.push({ visited: [], current: s, activeEdges: [], nodeLabels: labels, logs: [...logs] });
  };
  
  pushStep(slow, fast);
  
  do {
    slow = next[slow];
    fast = next[next[fast]];
    pushStep(slow, fast);
  } while (slow !== fast);
  
  let cycleStartPosition = 0;
  slow = 0;
  while (slow !== fast) {
    slow = next[slow];
    fast = next[fast];
    cycleStartPosition++;
    pushStep(slow, fast);
  }
  
  logs.push(`cycle start position: ${cycleStartPosition}`);
  pushStep(slow, fast);
  
  let cycleLength = 1;
  fast = next[slow];
  pushStep(slow, fast);
  while (slow !== fast) {
    fast = next[fast];
    cycleLength++;
    pushStep(slow, fast);
  }
  
  logs.push(`cycle length: ${cycleLength}`);
  steps.push({ visited: [], current: -1, activeEdges: [], nodeLabels: { [slow]: "S, F" }, logs: [...logs] });
  
  return steps;
}

function getGraphSteps(name: string, nodes: Node[], edges: Edge[]): GStep[] {
  if (name.includes("Breadth-First") || name.includes("BFS")) return bfsSteps(nodes, edges);
  if (name.includes("Depth-Limited")) return depthLimitedSteps(nodes, edges);
  if (name.includes("Depth-First") || name.includes("DFS")) return dfsSteps(nodes, edges);
  if (name.includes("Dijkstra")) return dijkstraSteps(nodes, edges);
  if (name.includes("Kruskal")) return kruskalSteps(nodes, edges);
  if (name.includes("Prim")) return primSteps(nodes, edges);
  if (name.includes("Bellman-Ford")) return bellmanFordSteps(nodes, edges);
  if (name.includes("Topological")) return topologicalSortSteps(nodes, edges);
  if (name.includes("Hamiltonian")) return hamiltonianSteps(nodes, edges);
  if (name.includes("Tarjan")) return tarjanSCCSteps(nodes, edges);
  if (name.includes("Bridge")) return bridgeFindingSteps(nodes, edges);
  if (name.includes("Bipartite")) return bipartitenessSteps(nodes, edges);
  if (name.includes("PageRank")) return pageRankSteps(nodes, edges);
  if (name.includes("Stable Matching")) return stableMatchingSteps(nodes, edges);
  if (name.includes("Cycle Detection")) return cycleDetectionSteps(nodes, edges);
  return bfsSteps(nodes, edges);
}

export function GraphViz({ isPlaying, speed, algorithmName, onCodeMarkerChange }: Props) {
  const graph = useMemo(() => buildGraph(algorithmName), [algorithmName]);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [nodeLabels, setNodeLabels] = useState<Record<number, string>>({});
  const [distanceLabels, setDistanceLabels] = useState<Record<number, string>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [colors, setColors] = useState<number[]>([]);
  const [pageRanks, setPageRanks] = useState<number[]>([]);
  const [outDegrees, setOutDegrees] = useState<number[]>([]);
  const [incomingMatrix, setIncomingMatrix] = useState<number[][]>([]);
  const [tarjanDisc, setTarjanDisc] = useState<number[]>([]);
  const [tarjanLow, setTarjanLow] = useState<number[]>([]);
  const [tarjanOnStack, setTarjanOnStack] = useState<boolean[]>([]);
  const [tarjanStack, setTarjanStack] = useState<number[]>([]);
  const stepRef = useRef(0);
  const stepsRef = useRef<GStep[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    stepsRef.current = getGraphSteps(algorithmName, graph.nodes, graph.edges);
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
        const s = stepsRef.current[stepRef.current];
        setVisited(new Set(s.visited));
        setCurrentNode(s.current < 0 ? null : s.current);
        setActiveEdges(new Set(s.activeEdges));
        setNodeLabels(s.nodeLabels ?? {});
        setDistanceLabels(s.distanceLabels ?? {});
        setLogs(s.logs ?? []);
        setColors(s.colors ?? []);
        setPageRanks(s.pageRanks ?? []);
        setOutDegrees(s.outDegrees ?? []);
        setIncomingMatrix(s.incomingMatrix ?? []);
        setTarjanDisc(s.tarjanDisc ?? []);
        setTarjanLow(s.tarjanLow ?? []);
        setTarjanOnStack(s.tarjanOnStack ?? []);
        setTarjanStack(s.tarjanStack ?? []);
        onCodeMarkerChange?.(s.codeMarker ?? null);
        stepRef.current++;
      }, Math.max(100, 800 - speed * 70));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    const z = stepsRef.current[0];
    setVisited(new Set(z?.visited ?? []));
    setActiveEdges(new Set(z?.activeEdges ?? []));
    setCurrentNode(z && z.current < 0 ? null : z?.current ?? null);
    setNodeLabels(z?.nodeLabels ?? {});
    setDistanceLabels(z?.distanceLabels ?? {});
    setLogs(z?.logs ?? []);
    setColors(z?.colors ?? []);
    setPageRanks(z?.pageRanks ?? []);
    setOutDegrees(z?.outDegrees ?? []);
    setIncomingMatrix(z?.incomingMatrix ?? []);
    setTarjanDisc(z?.tarjanDisc ?? []);
    setTarjanLow(z?.tarjanLow ?? []);
    setTarjanOnStack(z?.tarjanOnStack ?? []);
    setTarjanStack(z?.tarjanStack ?? []);
    onCodeMarkerChange?.(stepsRef.current[0]?.codeMarker ?? null);
    stepRef.current = 0;
  };

  const showWeights = algorithmName.includes("Dijkstra") || algorithmName.includes("Kruskal") ||
    algorithmName.includes("Prim") || algorithmName.includes("Bellman") || algorithmName.includes("Floyd") ||
    algorithmName.includes("Breadth-First");
  const isBFS = algorithmName.includes("Breadth-First");
  const isDFS = algorithmName.includes("Depth-First");
  const isDepthLimited = algorithmName.includes("Depth-Limited");
  const isTopological = algorithmName.includes("Topological");
  const isBipartite = algorithmName.includes("Bipartite");
  const isBridgeFinding = algorithmName.includes("Bridge");
  const isPageRank = algorithmName.includes("PageRank");
  const isTarjan = algorithmName.includes("Tarjan") || algorithmName.includes("Strongly Connected");
  const isBellmanFord = algorithmName.includes("Bellman-Ford");
  const isCycleDetection = algorithmName.includes("Cycle Detection");

  return (
    <div className={`w-full h-full flex flex-col items-center ${(isDepthLimited || isTopological || isBipartite || isBFS || isDFS || isBridgeFinding || isPageRank || isTarjan || isBellmanFord || isCycleDetection) ? "justify-start pt-2" : "justify-center"}`}>
      {isPageRank && (
        <div className="text-[10px] text-muted-foreground mb-2 w-full max-w-[24rem] self-center">Web Page inter-connections</div>
      )}
      {(isTarjan || isBellmanFord || isCycleDetection) && (
        <div className="text-[10px] text-muted-foreground mb-2 w-full max-w-[24rem] self-center">{isCycleDetection ? "Linked List" : "GraphTracer"}</div>
      )}
      <svg viewBox="0 0 400 340" className={isDepthLimited ? "w-full max-w-[18rem] h-[14rem]" : isTopological ? "w-full max-w-[24rem] h-[18rem]" : isBipartite ? "w-full max-w-[18rem] h-[14rem]" : isBFS ? "w-full max-w-[24rem] h-[18rem]" : isDFS ? "w-full max-w-[24rem] h-[18rem]" : isBridgeFinding ? "w-full max-w-[24rem] h-[18rem]" : isPageRank ? "w-full max-w-[24rem] h-[16rem]" : isTarjan || isBellmanFord || isCycleDetection ? "w-full max-w-[24rem] h-[16rem]" : "w-full max-w-md"}>
        {(isTopological || isPageRank || isTarjan || isBellmanFord || isCycleDetection) && (
          <defs>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(0, 0%, 72%)" />
            </marker>
          </defs>
        )}
        {graph.edges.map((e) => {
          const from = graph.nodes[e.from];
          const to = graph.nodes[e.to];
          const ek = (isPageRank || isTarjan || isBellmanFord || isCycleDetection) ? directedEdgeKey(e.from, e.to) : edgeKey(e.from, e.to);
          const active = activeEdges.has(ek);
          const edgeStroke = isBipartite
            ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
            : isBFS
              ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
            : isDFS
              ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
              : isPageRank
                ? active ? "hsl(0, 0%, 78%)" : "hsl(0, 0%, 52%)"
              : isTarjan
                ? active ? "hsl(330, 85%, 58%)" : "hsl(0, 0%, 55%)"
              : isBellmanFord
                ? active ? "hsl(0, 0%, 92%)" : "hsl(0, 0%, 68%)"
            : active ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 25%)";
          return (
            <g key={ek}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={edgeStroke}
                strokeWidth={active ? 2.5 : 1}
                markerEnd={(isPageRank || isTarjan || isBellmanFord || isCycleDetection) && !(isBipartite && active) ? "url(#graph-arrow)" : ""}
                className="transition-colors duration-200"
              />
              {showWeights && (
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 5}
                  fill={isBellmanFord ? "hsl(0, 0%, 72%)" : "hsl(150, 10%, 55%)"}
                  fontSize="9" textAnchor="middle"
                >
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}
        {graph.nodes.map((n) => {
          const isVisited = visited.has(n.id);
          const isCurrent = currentNode === n.id;
          const label = isPageRank ? String(n.id) : isBellmanFord ? String(n.id) : nodeLabels[n.id];
          const colorValue = colors[n.id];
          const bipartiteFill = colorValue === 0
            ? "hsl(330, 85%, 48%)"
            : colorValue === 1
              ? "hsl(335, 78%, 42%)"
              : "hsl(150, 20%, 12%)";
          const tarjanVisited = isTarjan && isVisited;
          return (
            <g key={n.id}>
              {isCurrent && !isBipartite && !isBFS && !isDFS && !isPageRank && !isTarjan && !isBellmanFord && (
                <circle cx={n.x} cy={n.y} r={22} fill="none"
                  stroke="hsl(145, 60%, 45%)" strokeWidth={2} opacity={0.4} />
              )}
              {isCurrent && isBellmanFord && (
                <>
                  <circle cx={n.x} cy={n.y} r={26} fill="none"
                    stroke="hsl(215, 90%, 58%)" strokeWidth={2.5} opacity={0.35} />
                  <circle cx={n.x} cy={n.y} r={21} fill="none"
                    stroke="hsl(215, 95%, 62%)" strokeWidth={2} opacity={0.85} />
                </>
              )}
              {isCurrent && isPageRank && (
                <circle cx={n.x} cy={n.y} r={22} fill="none"
                  stroke="hsl(330, 85%, 58%)" strokeWidth={2} opacity={0.45} />
              )}
              {isCurrent && isTarjan && (
                <circle cx={n.x} cy={n.y} r={22} fill="none"
                  stroke="hsl(330, 85%, 65%)" strokeWidth={2} opacity={0.5} />
              )}
              <circle
                cx={n.x} cy={n.y} r={16}
                fill={isPageRank
                  ? (isCurrent ? "hsl(330, 85%, 42%)" : "hsl(150, 20%, 14%)")
                  : isBellmanFord
                    ? (isCurrent ? "hsl(215, 88%, 48%)" : isVisited ? "hsl(220, 8%, 22%)" : "hsl(220, 6%, 16%)")
                  : isTarjan
                    ? (tarjanVisited ? (isCurrent ? "hsl(330, 85%, 52%)" : "hsl(330, 85%, 42%)") : "hsl(150, 20%, 14%)")
                  : isBipartite ? bipartiteFill : isBFS ? (isVisited ? "hsl(330, 85%, 48%)" : "hsl(150, 20%, 12%)") : isDFS ? (isVisited ? "hsl(330, 85%, 48%)" : "hsl(150, 20%, 12%)") : isCurrent ? "hsl(145, 60%, 45%)" : isVisited ? "hsl(150, 30%, 20%)" : "hsl(150, 20%, 12%)"}
                stroke={isPageRank ? (isCurrent ? "hsl(330, 85%, 60%)" : "hsl(0, 0%, 45%)") : isBellmanFord ? (isCurrent ? "hsl(215, 95%, 72%)" : "hsl(0, 0%, 52%)") : isTarjan ? (tarjanVisited ? "hsl(330, 85%, 65%)" : "hsl(0, 0%, 45%)") : isBipartite ? "hsl(330, 85%, 58%)" : isBFS ? "hsl(330, 85%, 58%)" : isDFS ? "hsl(330, 85%, 58%)" : isVisited ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 30%)"}
                strokeWidth={(isVisited || isPageRank || (isTarjan && tarjanVisited) || (isBellmanFord && isVisited)) ? 2 : 1}
              />
              <text x={n.x} y={n.y + 4}
                fill={isCurrent && !isBipartite && !isBFS && !isDFS && !isPageRank && !isTarjan && !isBellmanFord ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 92%)"}
                fontSize="11" textAnchor="middle" fontWeight={600}
              >
                {label || n.id}
              </text>
              {isBellmanFord && nodeLabels[n.id] !== undefined && (
                <text
                  x={n.x + 26}
                  y={n.y + 5}
                  fill="hsl(0, 0%, 96%)"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight={600}
                >
                  {nodeLabels[n.id]}
                </text>
              )}
              {isBFS && distanceLabels[n.id] && (
                <text
                  x={n.x + 26}
                  y={n.y + 6}
                  fill="hsl(0, 0%, 92%)"
                  fontSize="14"
                  textAnchor="middle"
                  fontWeight={700}
                >
                  {distanceLabels[n.id]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {isTarjan && graph.nodes.length > 0 && (
        <>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">Disc (Discovery Time)</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                {graph.nodes.map((n) => (
                  <div key={`tj-d-i-${n.id}`} className="w-8 text-center text-[10px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {graph.nodes.map((n) => {
                  const d = tarjanDisc[n.id];
                  const hi = currentNode === n.id;
                  return (
                    <div
                      key={`tj-d-v-${n.id}`}
                      className="w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors"
                      style={{
                        background: hi ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                        borderColor: hi ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                        color: "hsl(150, 20%, 92%)",
                      }}
                    >
                      {d !== undefined && d >= 0 ? d : "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">Low (Lowest Link)</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                {graph.nodes.map((n) => (
                  <div key={`tj-l-i-${n.id}`} className="w-8 text-center text-[10px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {graph.nodes.map((n) => {
                  const lo = tarjanLow[n.id];
                  const hi = currentNode === n.id;
                  return (
                    <div
                      key={`tj-l-v-${n.id}`}
                      className="w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors"
                      style={{
                        background: hi ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                        borderColor: hi ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                        color: "hsl(150, 20%, 92%)",
                      }}
                    >
                      {lo !== undefined && lo >= 0 ? lo : "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">stackMember</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                {graph.nodes.map((n) => (
                  <div key={`tj-sm-i-${n.id}`} className="w-8 text-center text-[10px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {graph.nodes.map((n) => {
                  const sm = tarjanOnStack[n.id];
                  const on = sm === true;
                  const hi = currentNode === n.id;
                  return (
                    <div
                      key={`tj-sm-v-${n.id}`}
                      className="w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors"
                      style={{
                        background: on ? "hsl(330, 85%, 42%)" : hi ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                        borderColor: on ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                        color: "hsl(150, 20%, 92%)",
                      }}
                    >
                      {on ? "T" : "F"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">st (Stack)</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 min-h-[4rem]">
              {tarjanStack.length > 0 ? (
                <>
                  <div className="flex justify-center gap-1 mb-2 flex-wrap">
                    {tarjanStack.map((_, si) => (
                      <div key={`tj-st-i-${si}`} className="w-8 text-center text-[10px] text-muted-foreground">{si}</div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {tarjanStack.map((nid, si) => (
                      <div
                        key={`tj-st-v-${si}-${nid}`}
                        className="w-8 h-8 flex items-center justify-center text-xs font-mono border border-[hsl(330,85%,58%)] bg-[hsl(330,85%,42%)] text-[hsl(150,20%,92%)]"
                      >
                        {nid}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs font-mono text-muted-foreground text-center py-2">(empty)</div>
              )}
            </div>
          </div>
        </>
      )}
      {isPageRank && graph.nodes.length > 0 && (
        <>
          <div className="w-full mt-4 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">Web Page Ranks</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                {graph.nodes.map((n) => (
                  <div key={`pr-idx-${n.id}`} className="w-11 text-center text-[10px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {graph.nodes.map((n) => {
                  const r = pageRanks[n.id];
                  const show = typeof r === "number";
                  const isHi = currentNode === n.id;
                  return (
                    <div
                      key={`pr-val-${n.id}`}
                      className="w-11 h-8 flex items-center justify-center text-[11px] font-mono border transition-colors"
                      style={{
                        background: isHi ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                        borderColor: isHi ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                        color: "hsl(150, 20%, 92%)",
                      }}
                    >
                      {show ? r.toFixed(3) : "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">Outgoing Edge Counts</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                {graph.nodes.map((n) => (
                  <div key={`od-idx-${n.id}`} className="w-11 text-center text-[10px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {graph.nodes.map((n) => {
                  const od = outDegrees[n.id];
                  return (
                    <div
                      key={`od-val-${n.id}`}
                      className="w-11 h-8 flex items-center justify-center text-xs font-mono border border-[hsl(150,10%,30%)] bg-[hsl(150,10%,22%)] text-[hsl(150,20%,92%)]"
                    >
                      {od !== undefined ? od : "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-full mt-3 max-w-[24rem]">
            <div className="text-[10px] text-muted-foreground mb-2">Incoming Nodes</div>
            <div className="border border-border/20 bg-black/10 rounded-md p-3 overflow-x-auto">
              <div className="flex gap-0.5 mb-1 items-center">
                <div className="w-7 shrink-0 text-[9px] text-muted-foreground" />
                {graph.nodes.map((n) => (
                  <div key={`in-h-${n.id}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground">{n.id}</div>
                ))}
              </div>
              {incomingMatrix.map((row, i) => (
                <div key={`in-row-${i}`} className="flex gap-0.5 items-center mb-0.5">
                  <div className="w-7 shrink-0 text-[9px] text-muted-foreground text-right pr-0.5">{i}</div>
                  {row.map((cell, j) => (
                    <div
                      key={`in-${i}-${j}`}
                      className="w-8 h-7 shrink-0 flex items-center justify-center text-[10px] font-mono border border-[hsl(150,10%,28%)] bg-[hsl(150,10%,18%)] text-[hsl(150,20%,88%)]"
                    >
                      {cell < 0 ? "-1" : cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {algorithmName.includes("Dijkstra") && (
        <div className="w-full mt-4 max-w-[24rem]">
          <div className="text-[10px] text-muted-foreground mb-2">Array1DTracer</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-3 max-w-min mx-auto">
            <div className="flex justify-start mb-1">
              {graph.nodes.map((n) => (
                <div key={`dj-idx-${n.id}`} className="w-8 shrink-0 text-center text-[9px] text-muted-foreground font-mono">{n.id}</div>
              ))}
            </div>
            <div className="flex justify-start">
              {graph.nodes.map((n, i) => {
                const isInf = !nodeLabels || Object.keys(nodeLabels).length === 0 || nodeLabels[n.id] === undefined || nodeLabels[n.id] === "∞";
                const val = isInf ? "∞" : nodeLabels[n.id];
                return (
                  <div
                    key={`dj-val-${n.id}`}
                    className="w-8 h-8 flex shrink-0 items-center justify-center text-[11px] font-mono transition-colors"
                    style={{
                      background: isInf ? "hsl(215, 15%, 15%)" : "hsl(224, 76%, 48%)", // visualizer complete blue
                      color: isInf ? "hsl(150, 20%, 88%)" : "white",
                      borderTop: '1px solid hsl(215, 10%, 26%)',
                      borderBottom: '1px solid hsl(215, 10%, 26%)',
                      borderLeft: '1px solid hsl(215, 10%, 26%)',
                      borderRight: i === graph.nodes.length - 1 ? '1px solid hsl(215, 10%, 26%)' : 'none',
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {(algorithmName.includes("Dijkstra") || algorithmName.includes("Kruskal") || algorithmName.includes("Prim") || isDepthLimited || isTopological || isBipartite || isBFS || isDFS || isBridgeFinding || isPageRank || isTarjan || isBellmanFord || isCycleDetection) && (
        <div className="w-full mt-6 border-t border-border/20 pt-3 max-w-[24rem]">
          <div className="text-[10px] text-muted-foreground mb-2">{isCycleDetection ? "Console" : "LogTracer"}</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {logs.length > 0 ? logs.slice(-12).map((entry, index) => (
              <div key={`${index}-${entry}`}>{entry}</div>
            )) : (
              <div>
                {isPageRank ? "Press play to run PageRank." : isTarjan ? "Press play to run Tarjan SCC." : isBellmanFord ? "Press play to run Bellman-Ford." : "Press play to start."}
              </div>
            )}
          </div>
        </div>
      )}
      {isDFS && (
        <div className="w-full mt-3 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">visited</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {graph.nodes.map((n) => (
                <div key={`dfs-index-${n.id}`} className="w-7 text-center text-[10px] text-muted-foreground">{n.id}</div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {graph.nodes.map((n) => (
                <div
                  key={`dfs-visited-${n.id}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                  style={{
                    background: visited.has(n.id) ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                    borderColor: visited.has(n.id) ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                    color: "hsl(150, 20%, 92%)",
                  }}
                >
                  {visited.has(n.id) ? "T" : "F"}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {isBipartite && (
        <div className="w-full mt-3 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">Colors</div>
          <div className="border border-border/20 bg-black/10 rounded-md p-4">
            <div className="flex justify-center gap-1 mb-2">
              {graph.nodes.map((n) => (
                <div key={`color-index-${n.id}`} className="w-7 text-center text-[10px] text-muted-foreground">{n.id}</div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {graph.nodes.map((n) => {
                const value = colors[n.id];
                const isSet = value !== undefined && value !== -1;
                return (
                  <div
                    key={`color-value-${n.id}`}
                    className="w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors"
                    style={{
                      background: isSet ? "hsl(330, 85%, 48%)" : "hsl(150, 10%, 22%)",
                      borderColor: isSet ? "hsl(330, 85%, 60%)" : "hsl(150, 10%, 30%)",
                      color: "hsl(150, 20%, 92%)",
                    }}
                  >
                    {isSet ? value : "-"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2">
        Reset Graph
      </button>
    </div>
  );
}
