import { useState, useEffect, useRef } from "react";

interface Props {
  isPlaying: boolean;
  speed: number;
}

interface Point { x: number; y: number; cluster: number; }
interface Center { x: number; y: number; }
interface KMeansStep {
  points: Point[];
  centers: Center[];
  clusters: Point[][];
  logs: string[];
}

function generateKMeansSteps(): KMeansStep[] {
  const data: Point[] = [
    {x: 8, y: 8, cluster: -1}, {x: 7, y: 3, cluster: -1}, {x: 7, y: 8, cluster: -1},
    {x: 7, y: 5, cluster: -1}, {x: 8, y: 8, cluster: -1}, {x: 6, y: 9, cluster: -1},
    {x: 3, y: 9, cluster: -1}, {x: 3, y: 5, cluster: -1}, {x: 3, y: 9, cluster: -1},
    {x: 1, y: 5, cluster: -1}
  ];
  let centers: Center[] = [ {x: 8, y: 8}, {x: 3, y: 9} ];
  let points = [...data];
  const steps: KMeansStep[] = [];
  const logs: string[] = [];

  const push = (cClusters: Point[][]) => {
    steps.push({
      points: points.map(p => ({...p})),
      centers: centers.map(c => ({...c})),
      clusters: cClusters.map(cls => cls.map(p => ({...p}))),
      logs: [...logs]
    });
  };

  push([[], []]); // initial state

  let loops = 0;
  while (loops < 10) {
    loops++;
    let newClusters: Point[][] = [[], []];
    
    // Assign points
    points = points.map(p => {
      let d0 = Math.hypot(p.x - centers[0].x, p.y - centers[0].y);
      let d1 = Math.hypot(p.x - centers[1].x, p.y - centers[1].y);
      let cluster = d0 < d1 ? 0 : 1;
      let newP = {...p, cluster};
      newClusters[cluster].push(newP);
      return newP;
    });

    logs.push("Clusters:");
    newClusters.forEach(cls => {
      logs.push(`      ${cls.map(p => `(${p.x}, ${p.y})`).join(", ")}`);
    });

    let oldCenters = [...centers];
    centers = newClusters.map((cls, i) => {
      if (cls.length === 0) return oldCenters[i];
      let sumX = cls.reduce((s, p) => s + p.x, 0);
      let sumY = cls.reduce((s, p) => s + p.y, 0);
      return { x: sumX / cls.length, y: sumY / cls.length };
    });

    logs.push("Centers:");
    logs.push(`      (${centers.map(c => `${c.x}, ${c.y}`).join("), (")})`);

    let changed = oldCenters.some((c, i) => Math.abs(c.x - centers[i].x) > 1e-9 || Math.abs(c.y - centers[i].y) > 1e-9);

    if (!changed) {
      logs.push("Final clustered data =");
      newClusters.forEach(cls => {
        logs.push(`      ${cls.map(p => `(${p.x}, ${p.y})`).join(", ")}`);
      });
      logs.push(`Best centers = (${centers.map(c => `${c.x}, ${c.y}`).join("), (")})`);
      push(newClusters);
      break;
    } else {
      push(newClusters);
    }
  }

  return steps;
}

const steps = generateKMeansSteps();

export function PointsViz({ isPlaying, speed }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, Math.max(300, 1500 - speed * 150));
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, stepIdx]);

  const reset = () => setStepIdx(0);
  
  const currentStep = steps[stepIdx];
  const { points, centers, clusters, logs } = currentStep;
  const maxClusterSize = Math.max(0, ...clusters.map(c => c.length));
  
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs.length, stepIdx]);

  const colors = ["#ef4444", "#3b82f6"]; // Red and Blue

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#0a0a0a] rounded-xl overflow-hidden glass border border-white/10 relative">
      {/* Scatter */}
      <div className="flex-[4] relative border-b border-border/20 bg-[#111110] p-4 flex flex-col min-h-[150px]">
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded text-[10px] text-white/50 font-mono z-10">
          Scatter
        </div>
        <div className="flex-1 w-full relative mt-4 pt-2">
          <svg className="w-full h-full" viewBox="0 0 110 110" preserveAspectRatio="xMidYMid meet">
            {[...Array(11)].map((_, i) => (
              <g key={`grid-y-${i}`}>
                <line x1={8} y1={100 - i * 10} x2={110} y2={100 - i * 10} stroke="#333" strokeWidth="0.5" />
                {i > 0 && i % 2 !== 0 && <text x={6} y={100 - i * 10 + 1.5} fontSize="4" fill="#666" textAnchor="end">{i}</text>}
              </g>
            ))}
            {[...Array(11)].map((_, i) => (
              <g key={`grid-x-${i}`}>
                <line x1={10 + i * 10} y1={0} x2={10 + i * 10} y2={102} stroke="#333" strokeWidth="0.5" />
                {i > 0 && i % 2 !== 0 && <text x={10 + i * 10} y={106} fontSize="4" fill="#666" textAnchor="middle">{i}</text>}
              </g>
            ))}
            {points.map((p, i) => (
              <circle key={`p-${i}`} cx={10 + p.x * 10} cy={100 - p.y * 10} r={1.5} fill={p.cluster === -1 ? "#888" : colors[p.cluster]} />
            ))}
            {centers.map((c, i) => (
              <g key={`c-${i}`}>
                <circle cx={10 + c.x * 10} cy={100 - c.y * 10} r={3} fill={colors[i]} stroke="#fff" strokeWidth={0.5} opacity={1} />
                <circle cx={10 + c.x * 10} cy={100 - c.y * 10} r={5} fill="none" stroke={colors[i]} strokeWidth={0.5} opacity={0.5} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-[3] relative border-b border-border/20 bg-[#1c1c1a] p-4 flex flex-col min-h-[120px]">
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded text-[10px] text-white/50 font-mono z-10">
          Grid
        </div>
        <div className="flex-1 overflow-x-auto flex items-center justify-center pt-6 pb-2">
          {clusters.length > 0 && maxClusterSize > 0 ? (
            <table className="border-collapse text-[10px] sm:text-xs font-mono">
              <thead>
                <tr>
                  <th className="px-2 pb-2"></th>
                  {Array.from({ length: maxClusterSize }).map((_, i) => (
                    <th key={i} className="px-3 pb-2 text-[#666] font-normal">{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clusters.map((cls, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-1.5 text-[#666] text-right pr-4">{idx}</td>
                    {Array.from({ length: maxClusterSize }).map((_, i) => (
                      <td key={i} className="px-1 py-1">
                        {cls[i] ? (
                          <div className="px-2 py-1.5 border border-border/20 text-center bg-black/20 text-gray-300 rounded whitespace-nowrap">
                            ({cls[i].x}, {cls[i].y})
                          </div>
                        ) : (
                          <div className="px-2 py-1.5 w-full h-full"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted-foreground text-xs">Waiting for clusters...</div>
          )}
        </div>
      </div>

      {/* Console */}
      <div className="flex-[3] relative bg-[#0a0a0a] p-4 flex flex-col min-h-[120px]">
         <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded text-[10px] text-white/50 font-mono z-10">
          Console
        </div>
        <div className="flex-1 overflow-y-auto mt-6 text-[10px] sm:text-[11px] font-mono text-muted-foreground whitespace-pre">
          {logs.length > 0 ? (
            logs.map((L, idx) => <div key={idx} className="mb-0.5 leading-relaxed">{L}</div>)
          ) : (
            <div>Press play to begin processing...</div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      
      <button onClick={reset} className="absolute bottom-2 right-4 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-black/40 px-2 py-1 rounded border border-white/10 z-20">
        Reset
      </button>
    </div>
  );
}
