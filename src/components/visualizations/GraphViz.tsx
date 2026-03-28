import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  dist[0] = 0;

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!vis.has(v) && (u === -1 || dist[v] < dist[u])) u = v;
    if (u === -1 || dist[u] === Infinity) break;
    vis.add(u);
    const labels: Record<number, string> = {};
    for (let v = 0; v < n; v++) labels[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
    steps.push({ visited: [...vis], current: u, activeEdges: steps.length > 0 ? [...steps[steps.length - 1].activeEdges] : [], nodeLabels: labels });
    for (const { to, w } of adj[u]) {
      if (!vis.has(to) && dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        const labels2: Record<number, string> = {};
        for (let v = 0; v < n; v++) labels2[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
        steps.push({ visited: [...vis], current: u, activeEdges: [...steps[steps.length - 1].activeEdges, edgeKey(u, to)], nodeLabels: labels2 });
      }
    }
  }
  return steps;
}

function kruskalSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: nodes.length }, (_, i) => i);
  function find(x: number): number { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  const steps: GStep[] = [];
  const mstEdges: string[] = [];
  const connected = new Set<number>();
  for (const e of sorted) {
    const pu = find(e.from), pv = find(e.to);
    steps.push({ visited: [...connected], current: e.from, activeEdges: [...mstEdges, edgeKey(e.from, e.to)] });
    if (pu !== pv) {
      parent[pu] = pv;
      mstEdges.push(edgeKey(e.from, e.to));
      connected.add(e.from);
      connected.add(e.to);
      steps.push({ visited: [...connected], current: e.to, activeEdges: [...mstEdges] });
    }
  }
  return steps;
}

function primSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  edges.forEach(e => { adj[e.from].push({ to: e.to, w: e.weight }); adj[e.to].push({ to: e.from, w: e.weight }); });
  const inMST = new Set<number>();
  const key = Array(n).fill(Infinity);
  const parent = Array(n).fill(-1);
  const steps: GStep[] = [];
  const mstEdges: string[] = [];
  key[0] = 0;

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!inMST.has(v) && (u === -1 || key[v] < key[u])) u = v;
    inMST.add(u);
    if (parent[u] !== -1) {
      mstEdges.push(edgeKey(u, parent[u]));
    }
    steps.push({ visited: [...inMST], current: u, activeEdges: [...mstEdges] });
    for (const { to, w } of adj[u]) {
      if (!inMST.has(to) && w < key[to]) {
        key[to] = w;
        parent[to] = u;
      }
    }
  }
  steps.push({ visited: [...inMST], current: -1, activeEdges: [...mstEdges] });
  return steps;
}

function bellmanFordSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const n = nodes.length;
  const dist = Array(n).fill(Infinity);
  dist[0] = 0;
  const steps: GStep[] = [];
  const relaxedEdges: string[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (const e of edges) {
      const labels: Record<number, string> = {};
      for (let v = 0; v < n; v++) labels[v] = dist[v] === Infinity ? "∞" : String(dist[v]);
      if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
        dist[e.to] = dist[e.from] + e.weight;
        relaxedEdges.push(edgeKey(e.from, e.to));
        steps.push({ visited: dist.map((d, i) => d < Infinity ? i : -1).filter(x => x >= 0), current: e.to, activeEdges: [...relaxedEdges], nodeLabels: labels });
      }
      if (dist[e.to] !== Infinity && dist[e.to] + e.weight < dist[e.from]) {
        dist[e.from] = dist[e.to] + e.weight;
        relaxedEdges.push(edgeKey(e.from, e.to));
        steps.push({ visited: dist.map((d, i) => d < Infinity ? i : -1).filter(x => x >= 0), current: e.from, activeEdges: [...relaxedEdges], nodeLabels: labels });
      }
    }
  }
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
  // Directed edges: use from→to only
  edges.forEach(e => { adj[e.from].push(e.to); });
  const disc = Array(n).fill(-1);
  const low = Array(n).fill(-1);
  const onStack = Array(n).fill(false);
  const stack: number[] = [];
  let timer = 0;
  const steps: GStep[] = [];
  const visited: number[] = [];
  const ae: string[] = [];
  const sccColors: Record<number, string> = {};
  let sccCount = 0;
  const colors = ["0", "1", "2", "3", "4"];

  function dfs(u: number) {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;
    visited.push(u);
    const labels: Record<number, string> = {};
    for (let i = 0; i < n; i++) if (disc[i] >= 0) labels[i] = `${disc[i]}/${low[i]}`;
    steps.push({ visited: [...visited], current: u, activeEdges: [...ae], nodeLabels: labels });

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        ae.push(edgeKey(u, v));
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }

    if (low[u] === disc[u]) {
      const scc: number[] = [];
      while (true) {
        const v = stack.pop()!;
        onStack[v] = false;
        scc.push(v);
        sccColors[v] = colors[sccCount % colors.length];
        if (v === u) break;
      }
      sccCount++;
      const labels2: Record<number, string> = {};
      for (const v of scc) labels2[v] = `SCC${sccCount}`;
      steps.push({ visited: [...visited], current: u, activeEdges: [...ae], nodeLabels: labels2 });
    }
  }

  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);
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
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const d = 0.85;
  let pr = Array(n).fill(1 / n);
  const steps: GStep[] = [];
  const ae = edges.map(e => edgeKey(e.from, e.to));

  for (let iter = 0; iter < 8; iter++) {
    const newPR = Array(n).fill((1 - d) / n);
    for (let u = 0; u < n; u++) {
      const outDeg = adj[u].length;
      for (const v of adj[u]) newPR[v] += d * pr[u] / outDeg;
    }
    pr = newPR;
    const labels: Record<number, string> = {};
    for (let i = 0; i < n; i++) labels[i] = pr[i].toFixed(2);
    steps.push({ visited: Array.from({ length: n }, (_, i) => i), current: iter % n, activeEdges: ae, nodeLabels: labels });
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

function cycleDetectionSteps(nodes: Node[], edges: Edge[]): GStep[] {
  const adj: number[][] = Array.from({ length: nodes.length }, () => []);
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  const steps: GStep[] = [];
  const visited = new Set<number>();
  const ae: string[] = [];

  // DFS-based cycle detection
  function dfs(u: number, parent: number) {
    visited.add(u);
    steps.push({ visited: [...visited], current: u, activeEdges: [...ae] });
    for (const v of adj[u]) {
      if (!visited.has(v)) {
        ae.push(edgeKey(u, v));
        dfs(v, u);
      } else if (v !== parent) {
        // Cycle found
        ae.push(edgeKey(u, v));
        steps.push({ visited: [...visited], current: v, activeEdges: [...ae], nodeLabels: { [u]: "CYC", [v]: "CYC" } });
        return;
      }
    }
  }
  dfs(0, -1);
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
        setCurrentNode(s.current);
        setActiveEdges(new Set(s.activeEdges));
        if (s.nodeLabels) setNodeLabels(s.nodeLabels);
        setDistanceLabels(s.distanceLabels ?? {});
        setLogs(s.logs ?? []);
        setColors(s.colors ?? []);
        onCodeMarkerChange?.(s.codeMarker ?? null);
        stepRef.current++;
      }, Math.max(100, 800 - speed * 70));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    setVisited(new Set());
    setActiveEdges(new Set());
    setCurrentNode(null);
    setNodeLabels({});
    setDistanceLabels(stepsRef.current[0]?.distanceLabels ?? {});
    setLogs(stepsRef.current[0]?.logs ?? []);
    setColors(stepsRef.current[0]?.colors ?? []);
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

  return (
    <div className={`w-full h-full flex flex-col items-center ${(isDepthLimited || isTopological || isBipartite || isBFS || isDFS || isBridgeFinding) ? "justify-start pt-2" : "justify-center"}`}>
      <svg viewBox="0 0 400 340" className={isDepthLimited ? "w-full max-w-[18rem] h-[14rem]" : isTopological ? "w-full max-w-[24rem] h-[18rem]" : isBipartite ? "w-full max-w-[18rem] h-[14rem]" : isBFS ? "w-full max-w-[24rem] h-[18rem]" : isDFS ? "w-full max-w-[24rem] h-[18rem]" : isBridgeFinding ? "w-full max-w-[24rem] h-[18rem]" : "w-full max-w-md"}>
        {isTopological && (
          <defs>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(0, 0%, 72%)" />
            </marker>
          </defs>
        )}
        {graph.edges.map((e) => {
          const from = graph.nodes[e.from];
          const to = graph.nodes[e.to];
          const ek = edgeKey(e.from, e.to);
          const active = activeEdges.has(ek);
          const edgeStroke = isBipartite
            ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
            : isBFS
              ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
            : isDFS
              ? active ? "hsl(330, 85%, 48%)" : "hsl(0, 0%, 72%)"
            : active ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 25%)";
          return (
            <g key={ek}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={edgeStroke}
                strokeWidth={active ? 3 : 1.5}
                opacity={(isBipartite || isBFS || isDFS) ? 1 : active ? 1 : 0.5}
                markerEnd={isTopological ? "url(#graph-arrow)" : undefined}
              />
              {showWeights && (
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 5}
                  fill="hsl(150, 10%, 55%)" fontSize="9" textAnchor="middle"
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
          const label = nodeLabels[n.id];
          const colorValue = colors[n.id];
          const bipartiteFill = colorValue === 0
            ? "hsl(330, 85%, 48%)"
            : colorValue === 1
              ? "hsl(335, 78%, 42%)"
              : "hsl(150, 20%, 12%)";
          return (
            <g key={n.id}>
              {isCurrent && !isBipartite && !isBFS && !isDFS && (
                <circle cx={n.x} cy={n.y} r={22} fill="none"
                  stroke="hsl(145, 60%, 45%)" strokeWidth={2} opacity={0.4} />
              )}
              <circle
                cx={n.x} cy={n.y} r={16}
                fill={isBipartite ? bipartiteFill : isBFS ? (isVisited ? "hsl(330, 85%, 48%)" : "hsl(150, 20%, 12%)") : isDFS ? (isVisited ? "hsl(330, 85%, 48%)" : "hsl(150, 20%, 12%)") : isCurrent ? "hsl(145, 60%, 45%)" : isVisited ? "hsl(150, 30%, 20%)" : "hsl(150, 20%, 12%)"}
                stroke={isBipartite ? "hsl(330, 85%, 58%)" : isBFS ? "hsl(330, 85%, 58%)" : isDFS ? "hsl(330, 85%, 58%)" : isVisited ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 30%)"}
                strokeWidth={isVisited ? 2 : 1}
              />
              <text x={n.x} y={n.y + 4}
                fill={isCurrent && !isBipartite && !isBFS && !isDFS ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 92%)"}
                fontSize="11" textAnchor="middle" fontWeight={600}
              >
                {label || n.id}
              </text>
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
      {(isDepthLimited || isTopological || isBipartite || isBFS || isDFS || isBridgeFinding) && (
        <div className="w-full mt-6 border-t border-border/20 pt-3">
          <div className="text-[10px] text-muted-foreground mb-2">LogTracer</div>
          <div className="min-h-24 rounded-md border border-border/20 bg-black/10 p-4 text-xs font-mono text-foreground/90">
            {logs.length > 0 ? logs.slice(-8).map((entry, index) => (
              <div key={`${index}-${entry}`}>{entry}</div>
            )) : (
              <div>Press play to start the search.</div>
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
