import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
}

interface Point { x: number; y: number; cluster: number; }

function generatePoints(n = 40, k = 3): Point[] {
  const centers = [
    { x: 100, y: 100 }, { x: 280, y: 80 }, { x: 190, y: 260 },
  ];
  return Array.from({ length: n }, () => {
    const c = Math.floor(Math.random() * k);
    return {
      x: centers[c].x + (Math.random() - 0.5) * 80,
      y: centers[c].y + (Math.random() - 0.5) * 80,
      cluster: -1,
    };
  });
}

const clusterColors = [
  "hsl(145, 60%, 45%)", "hsl(200, 70%, 50%)", "hsl(330, 70%, 55%)",
];

export function PointsViz({ isPlaying, speed }: Props) {
  const [points, setPoints] = useState(() => generatePoints());
  const [centroids, setCentroids] = useState<Array<{ x: number; y: number }>>([
    { x: 150, y: 150 }, { x: 250, y: 100 }, { x: 200, y: 250 },
  ]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setPoints(prev => {
          const assigned = prev.map(p => {
            let minD = Infinity, best = 0;
            centroids.forEach((c, i) => {
              const d = Math.hypot(p.x - c.x, p.y - c.y);
              if (d < minD) { minD = d; best = i; }
            });
            return { ...p, cluster: best };
          });
          const newCentroids = centroids.map((_, i) => {
            const cluster = assigned.filter(p => p.cluster === i);
            if (cluster.length === 0) return centroids[i];
            return {
              x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length,
              y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length,
            };
          });
          setCentroids(newCentroids);
          return assigned;
        });
      }, Math.max(300, 1200 - speed * 100));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, centroids]);

  const reset = () => {
    setPoints(generatePoints());
    setCentroids([{ x: 150, y: 150 }, { x: 250, y: 100 }, { x: 200, y: 250 }]);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 400 340" className="w-full max-w-md">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={p.cluster >= 0 ? clusterColors[p.cluster] : "hsl(150, 15%, 30%)"}
            opacity={0.8}
          />
        ))}
        {centroids.map((c, i) => (
          <g key={`c-${i}`}>
            <circle cx={c.x} cy={c.y} r={8} fill={clusterColors[i]} opacity={0.3} />
            <circle cx={c.x} cy={c.y} r={5} fill={clusterColors[i]} stroke="hsl(150, 30%, 4%)" strokeWidth={2} />
          </g>
        ))}
      </svg>
      <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2">
        Reset
      </button>
    </div>
  );
}
