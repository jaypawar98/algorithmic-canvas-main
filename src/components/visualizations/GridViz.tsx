import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
  algorithmName: string;
  onCodeMarkerChange?: (marker: string | null) => void;
}

type GridStep = {
  board: number[][];
  highlight: [number, number] | null;
  highlight2?: [number, number] | null;
  codeMarker?: string | null;
};

function solveNQueens(n: number): GridStep[] {
  const steps: GridStep[] = [];
  const board = Array.from({ length: n }, () => Array(n).fill(0));
  function isSafe(row: number, col: number) {
    for (let i = 0; i < col; i++) if (board[row][i]) return false;
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return false;
    for (let i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j]) return false;
    return true;
  }
  function solve(col: number): boolean {
    if (col >= n) {
      steps.push({ board: board.map(r => [...r]), highlight: null, codeMarker: "base-case" });
      return true;
    }
    for (let i = 0; i < n; i++) {
      steps.push({ board: board.map(r => [...r]), highlight: [i, col], codeMarker: "check-safe" });
      if (isSafe(i, col)) {
        board[i][col] = 1;
        steps.push({ board: board.map(r => [...r]), highlight: [i, col], codeMarker: "place-queen" });
        steps.push({ board: board.map(r => [...r]), highlight: [i, col], codeMarker: "recurse" });
        if (solve(col + 1)) return true;
        board[i][col] = 0;
        steps.push({ board: board.map(r => [...r]), highlight: [i, col], codeMarker: "backtrack" });
      }
    }
    return false;
  }
  solve(0);
  steps.push({ board: board.map(r => [...r]), highlight: null, codeMarker: "return-result" });
  return steps;
}

function knightsTour(n: number): GridStep[] {
  const steps: GridStep[] = [];
  const board = Array.from({ length: n }, () => Array(n).fill(-1));
  const dx = [2, 1, -1, -2, -2, -1, 1, 2];
  const dy = [1, 2, 2, 1, -1, -2, -2, -1];
  let moveNum = 0;
  board[0][0] = moveNum++;
  steps.push({ board: board.map(r => [...r]), highlight: [0, 0], codeMarker: "init-board" });

  function getDegree(x: number, y: number) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      const nx = x + dx[i], ny = y + dy[i];
      if (nx >= 0 && nx < n && ny >= 0 && ny < n && board[nx][ny] === -1) count++;
    }
    return count;
  }

  function solve(x: number, y: number): boolean {
    if (moveNum === n * n) {
      steps.push({ board: board.map(r => [...r]), highlight: [x, y], codeMarker: "base-case" });
      return true;
    }
    const moves: Array<{ nx: number; ny: number; deg: number }> = [];
    for (let i = 0; i < 8; i++) {
      const nx = x + dx[i], ny = y + dy[i];
      if (nx >= 0 && nx < n && ny >= 0 && ny < n && board[nx][ny] === -1) {
        moves.push({ nx, ny, deg: getDegree(nx, ny) });
        steps.push({ board: board.map(r => [...r]), highlight: [nx, ny], codeMarker: "check-move" });
      }
    }
    moves.sort((a, b) => a.deg - b.deg); // Warnsdorff's rule
    for (const { nx, ny } of moves) {
      board[nx][ny] = moveNum++;
      steps.push({ board: board.map(r => [...r]), highlight: [nx, ny], codeMarker: "place-move" });
      steps.push({ board: board.map(r => [...r]), highlight: [nx, ny], codeMarker: "recurse" });
      if (solve(nx, ny)) return true;
      board[nx][ny] = -1;
      moveNum--;
      steps.push({ board: board.map(r => [...r]), highlight: [nx, ny], codeMarker: "backtrack" });
      if (steps.length > 300) return false; // limit
    }
    return false;
  }
  solve(0, 0);
  steps.push({ board: board.map(r => [...r]), highlight: null, codeMarker: "return-result" });
  return steps;
}

// Hamiltonian now uses GraphViz

function floodFillSteps(): GridStep[] {
  const board = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 2],
    [2, 0, 0, 2, 0, 0, 0, 0, 2],
    [2, 2, 2, 0, 0, 0, 2, 2, 2],
    [2, 0, 0, 0, 0, 2, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
  ];
  const steps: GridStep[] = [];
  const visited = new Set<string>();
  const rows = board.length;
  const cols = board[0].length;

  function fill(r: number, c: number) {
    steps.push({ board: board.map(row => [...row]), highlight: [r, c], codeMarker: "check-bounds" });
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;

    steps.push({ board: board.map(row => [...row]), highlight: [r, c], codeMarker: "check-color" });
    if (board[r][c] !== 0) return;

    visited.add(`${r},${c}`);
    board[r][c] = 1;
    steps.push({ board: board.map(row => [...row]), highlight: [r, c], codeMarker: "fill-cell" });

    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
      const nr = r + dr;
      const nc = c + dc;
      steps.push({ board: board.map(row => [...row]), highlight: [r, c], highlight2: [nr, nc], codeMarker: "recurse-neighbor" });
      if (!visited.has(`${nr},${nc}`)) fill(nr, nc);
    }
  }

  fill(4, 4);
  steps.push({ board: board.map(row => [...row]), highlight: null, codeMarker: "return-result" });
  return steps;
}

function sieveSteps(): GridStep[] {
  const n = 100;
  const cols = 10;
  const rows = 10;
  const isPrime = Array(n + 1).fill(1);
  isPrime[0] = 0; isPrime[1] = 0;
  const board: number[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const num = r * cols + c + 1;
      return num <= n ? 1 : 0;
    })
  );
  // 1 = unmarked, 2 = prime, 3 = crossed out
  board[0][0] = 3; // 1 is not prime
  const steps: GridStep[] = [];
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue;
    const pr = Math.floor((p - 1) / cols), pc = (p - 1) % cols;
    board[pr][pc] = 2;
    steps.push({ board: board.map(r => [...r]), highlight: [pr, pc] });
    for (let m = p * p; m <= n; m += p) {
      isPrime[m] = 0;
      const mr = Math.floor((m - 1) / cols), mc = (m - 1) % cols;
      board[mr][mc] = 3;
      steps.push({ board: board.map(r => [...r]), highlight: [mr, mc] });
    }
  }
  // Mark remaining primes
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      const r = Math.floor((i - 1) / cols), c = (i - 1) % cols;
      board[r][c] = 2;
    }
  }
  steps.push({ board: board.map(r => [...r]), highlight: null });
  return steps;
}

function cellularAutomataSteps(): GridStep[] {
  const cols = 20, rows = 15;
  const board: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  // Random initial state
  for (let c = 0; c < cols; c++) board[0][c] = Math.random() > 0.5 ? 1 : 0;
  const steps: GridStep[] = [{ board: board.map(r => [...r]), highlight: null }];
  for (let gen = 1; gen < rows; gen++) {
    for (let c = 0; c < cols; c++) {
      const l = board[gen - 1][(c - 1 + cols) % cols];
      const m = board[gen - 1][c];
      const r = board[gen - 1][(c + 1) % cols];
      // Rule 110
      const pattern = (l << 2) | (m << 1) | r;
      board[gen][c] = (110 >> pattern) & 1;
    }
    steps.push({ board: board.map(r => [...r]), highlight: [gen, 0] });
  }
  return steps;
}

function magicSquareSteps(): GridStep[] {
  const n = 5;
  const board = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: GridStep[] = [];
  let r = 0, c = Math.floor(n / 2);
  for (let num = 1; num <= n * n; num++) {
    board[r][c] = num;
    steps.push({ board: board.map(r => [...r]), highlight: [r, c] });
    const nr = (r - 1 + n) % n, nc = (c + 1) % n;
    if (board[nr][nc] !== 0) {
      r = (r + 1) % n;
    } else {
      r = nr; c = nc;
    }
  }
  return steps;
}

function getGridSteps(name: string): { steps: GridStep[]; cellSize: number; showNumbers: boolean } {
  if (name.includes("N-Queens")) return { steps: solveNQueens(8), cellSize: 36, showNumbers: false };
  if (name.includes("Knight")) return { steps: knightsTour(6), cellSize: 45, showNumbers: true };
  if (name.includes("Flood Fill")) return { steps: floodFillSteps(), cellSize: 32, showNumbers: false };
  if (name.includes("Sieve")) return { steps: sieveSteps(), cellSize: 26, showNumbers: true };
  if (name.includes("Cellular")) return { steps: cellularAutomataSteps(), cellSize: 18, showNumbers: false };
  if (name.includes("Magic")) return { steps: magicSquareSteps(), cellSize: 45, showNumbers: true };
  return { steps: solveNQueens(8), cellSize: 36, showNumbers: false };
}

export function GridViz({ isPlaying, speed, algorithmName, onCodeMarkerChange }: Props) {
  const config = useRef(getGridSteps(algorithmName));
  const [board, setBoard] = useState<number[][]>([]);
  const [highlight, setHighlight] = useState<[number, number] | null>(null);
  const [highlight2, setHighlight2] = useState<[number, number] | null>(null);
  const stepRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    config.current = getGridSteps(algorithmName);
    reset();
    onCodeMarkerChange?.(config.current.steps[0]?.codeMarker ?? null);
  }, [algorithmName]);

  useEffect(() => {
    if (isPlaying && config.current.steps.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= config.current.steps.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        const s = config.current.steps[stepRef.current];
        setBoard(s.board);
        setHighlight(s.highlight);
        setHighlight2(s.highlight2 ?? null);
        onCodeMarkerChange?.(s.codeMarker ?? null);
        stepRef.current++;
      }, Math.max(20, 300 - speed * 28));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    const first = config.current.steps[0];
    setBoard(first ? first.board.map(r => [...r]) : []);
    setHighlight(first?.highlight ?? null);
    setHighlight2(first?.highlight2 ?? null);
    onCodeMarkerChange?.(first?.codeMarker ?? null);
    stepRef.current = first ? 1 : 0;
  };

  if (board.length === 0) return null;
  const { cellSize, showNumbers } = config.current;
  const n = board[0].length;
  const isSieve = algorithmName.includes("Sieve");
  const isNQueens = algorithmName.includes("N-Queens") || algorithmName.includes("Hamiltonian") || algorithmName.includes("Knight");
  const isCellular = algorithmName.includes("Cellular");
  const isFlood = algorithmName.includes("Flood");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isFlood && (
        <div className="mb-1 flex gap-[1px] text-[10px] text-muted-foreground font-mono" style={{ marginLeft: `${cellSize}px` }}>
          {board[0].map((_, c) => (
            <div key={`col-${c}`} style={{ width: cellSize }} className="text-center">{c}</div>
          ))}
        </div>
      )}
      <div className="flex items-start gap-[1px]">
        {isFlood && (
          <div className="flex flex-col gap-[1px] text-[10px] text-muted-foreground font-mono">
            {board.map((_, r) => (
              <div key={`row-${r}`} style={{ height: cellSize, width: cellSize }} className="flex items-center justify-center">{r}</div>
            ))}
          </div>
        )}
        <div className="inline-grid gap-[1px] rounded-xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isHighlight = highlight?.[0] === r && highlight?.[1] === c;
            const isDark = (r + c) % 2 === 1;
            const isHighlight2 = highlight2?.[0] === r && highlight2?.[1] === c;
            let bg: string;
            let content: React.ReactNode = null;

            if (isSieve) {
              const num = r * n + c + 1;
              bg = isHighlight ? "hsl(145, 60%, 45%)" : cell === 2 ? "hsl(145, 40%, 25%)" : cell === 3 ? "hsl(0, 40%, 15%)" : "hsl(150, 15%, 12%)";
              content = <span className="text-[8px]">{num}</span>;
            } else if (isCellular) {
              bg = cell === 1 ? "hsl(145, 60%, 45%)" : "hsl(150, 15%, 10%)";
            } else if (isNQueens && !showNumbers) {
              bg = isHighlight ? "hsl(45, 80%, 35%)" : isDark ? "hsl(150, 15%, 12%)" : "hsl(150, 15%, 18%)";
              if (cell === 1) content = <span className="text-lg">♛</span>;
            } else {
              // Knight's tour / Magic square / general with numbers
              bg = isHighlight ? "hsl(145, 60%, 45%)" : cell >= 0 ? "hsl(150, 25%, 18%)" : isDark ? "hsl(150, 15%, 12%)" : "hsl(150, 15%, 16%)";
              if (cell > 0 || (showNumbers && cell >= 0 && !isFlood)) {
                content = <span className="text-[10px] font-mono">{cell >= 0 ? cell : ""}</span>;
              }
              if (isFlood) {
                bg = isHighlight
                  ? "hsl(35, 95%, 72%)"
                  : isHighlight2
                    ? "hsl(35, 70%, 30%)"
                    : cell === 1
                      ? "hsl(330, 85%, 48%)"
                      : cell === 2
                        ? "hsl(150, 10%, 25%)"
                        : "hsl(150, 15%, 10%)";
                content = <span className="text-[12px] font-mono">{cell === 2 ? "#" : cell === 1 ? "a" : "-"}</span>;
              }
            }

            return (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center transition-all duration-100"
                style={{
                  width: cellSize, height: cellSize,
                  background: bg,
                  color: isHighlight ? "hsl(150, 30%, 4%)" : "hsl(150, 20%, 75%)",
                  boxShadow: isHighlight ? "inset 0 0 10px hsl(145, 60%, 45%, 0.3)" : "none",
                }}
              >
                {content}
              </div>
            );
          })
        )}
        </div>
      </div>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-3">
        Reset
      </button>
    </div>
  );
}
