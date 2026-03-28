import { AlgorithmInfo } from "@/data/algorithms";
import { BarChartViz } from "./visualizations/BarChartViz";
import { GraphViz } from "./visualizations/GraphViz";
import { GridViz } from "./visualizations/GridViz";
import { DPTableViz } from "./visualizations/DPTableViz";
import { RecursionTreeViz } from "./visualizations/RecursionTreeViz";
import { TextViz } from "./visualizations/TextViz";
import { PointsViz } from "./visualizations/PointsViz";
import { MazeViz } from "./visualizations/MazeViz";
import { TreeViz } from "./visualizations/TreeViz";
import { Sparkles } from "lucide-react";

interface Props {
  algorithm: AlgorithmInfo | null;
  category: string;
  isPlaying: boolean;
  speed: number;
  onCodeMarkerChange: (marker: string | null) => void;
}

export function VisualizationPanel({ algorithm, category, isPlaying, speed, onCodeMarkerChange }: Props) {
  if (!algorithm) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center glass rounded-2xl">
        <Sparkles className="w-12 h-12 text-primary/30 mb-4" />
        <p className="text-muted-foreground text-sm">Select an algorithm to visualize</p>
        <p className="text-muted-foreground/50 text-xs mt-1">Choose from the sidebar to get started</p>
      </div>
    );
  }

  const renderViz = () => {
    switch (algorithm.vizType) {
      case "bars":
        return <BarChartViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} onCodeMarkerChange={onCodeMarkerChange} />;
      case "graph":
        return <GraphViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} onCodeMarkerChange={onCodeMarkerChange} />;
      case "grid":
        return <GridViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} onCodeMarkerChange={onCodeMarkerChange} />;
      case "dp-table":
        return <DPTableViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} />;
      case "tree":
        return <TreeViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} onCodeMarkerChange={onCodeMarkerChange} />;
      case "recursion-tree":
        return <RecursionTreeViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} onCodeMarkerChange={onCodeMarkerChange} />;
      case "text":
        return <TextViz isPlaying={isPlaying} speed={speed} algorithmName={algorithm.name} />;
      case "points":
        return <PointsViz isPlaying={isPlaying} speed={speed} />;
      case "maze":
        return <MazeViz isPlaying={isPlaying} speed={speed} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Custom visualization for</p>
            <p className="text-primary font-semibold">{algorithm.name}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full glass rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{algorithm.name}</h3>
          <p className="text-[10px] text-muted-foreground">{category} • {algorithm.description}</p>
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
          <span>Time: <span className="text-primary">{algorithm.complexity.time}</span></span>
          <span>Space: <span className="text-primary">{algorithm.complexity.space}</span></span>
        </div>
      </div>
      <div className="flex-1 p-2">
        {renderViz()}
      </div>
    </div>
  );
}
