import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
}

const SIZE = 15;

function initGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
}

export function MazeViz({ isPlaying, speed }: Props) {
  const [grid, setGrid] = useState(initGrid);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stepsRef = useRef<Array<{ grid: number[][]; pos: [number, number] }>>([]);
  const stepRef = useRef(0);

  const generateMazeSteps = () => {
    const g = initGrid();
    const steps: Array<{ grid: number[][]; pos: [number, number] }> = [];
    const visited = new Set<string>();

    function carve(r: number, c: number) {
      g[r][c] = 0;
      visited.add(`${r},${c}`);
      steps.push({ grid: g.map(row => [...row]), pos: [r, c] });

      const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited.has(`${nr},${nc}`)) {
          g[r + dr / 2][c + dc / 2] = 0;
          steps.push({ grid: g.map(row => [...row]), pos: [r + dr / 2, c + dc / 2] });
          carve(nr, nc);
        }
      }
    }

    carve(1, 1);
    return steps;
  };

  useEffect(() => {
    stepsRef.current = generateMazeSteps();
  }, []);

  useEffect(() => {
    if (isPlaying && stepsRef.current.length > 0) {
      intervalRef.current = window.setInterval(() => {
        if (stepRef.current >= stepsRef.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        const s = stepsRef.current[stepRef.current];
        setGrid(s.grid);
        setCurrent(s.pos);
        stepRef.current++;
      }, Math.max(20, 200 - speed * 18));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    setGrid(initGrid());
    setCurrent(null);
    stepRef.current = 0;
    stepsRef.current = generateMazeSteps();
  };

  const cellSize = 20;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="inline-grid gap-0" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isCurrent = current?.[0] === r && current?.[1] === c;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: isCurrent
                    ? "hsl(145, 60%, 45%)"
                    : cell === 1
                    ? "hsl(150, 20%, 10%)"
                    : "hsl(150, 15%, 22%)",
                  boxShadow: isCurrent ? "0 0 6px hsl(145, 60%, 45%, 0.5)" : "none",
                }}
              />
            );
          })
        )}
      </div>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-3">
        Regenerate Maze
      </button>
    </div>
  );
}
