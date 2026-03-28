import { useState, useCallback } from "react";
import { AlgorithmSidebar } from "@/components/AlgorithmSidebar";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { CodeEditorPanel } from "@/components/CodeEditorPanel";
import { AlgorithmInfo } from "@/data/algorithms";
import { getStepMessage } from "@/lib/codeExecution";

const Index = () => {
  const [selected, setSelected] = useState<{ category: string; algorithm: AlgorithmInfo } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [resetKey, setResetKey] = useState(0);
  const [activeCodeMarker, setActiveCodeMarker] = useState<string | null>(null);
  const [stepLogs, setStepLogs] = useState<string[]>([]);

  const handleSelect = useCallback((category: string, algorithm: AlgorithmInfo) => {
    setIsPlaying(false);
    setSelected({ category, algorithm });
    setActiveCodeMarker(null);
    setStepLogs([]);
    setResetKey(k => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setActiveCodeMarker(null);
    setStepLogs([]);
    setResetKey(k => k + 1);
  }, []);

  const handleCodeMarkerChange = useCallback((marker: string | null) => {
    setActiveCodeMarker(marker);
    const message = selected ? getStepMessage(selected.algorithm.name, marker) : null;
    if (!message) return;
    setStepLogs((logs) => (logs[logs.length - 1] === message ? logs : [...logs.slice(-5), message]));
  }, [selected]);

  return (
    <div
      className="h-screen w-screen flex gap-3 p-3 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(150, 30%, 3%) 0%, hsl(160, 25%, 6%) 30%, hsl(145, 20%, 4%) 70%, hsl(140, 30%, 3%) 100%)",
      }}
    >
      <AlgorithmSidebar selected={selected} onSelect={handleSelect} />

      <div className="flex-1 min-w-0">
        <VisualizationPanel
          key={resetKey}
          algorithm={selected?.algorithm ?? null}
          category={selected?.category ?? ""}
          isPlaying={isPlaying}
          speed={speed}
          onCodeMarkerChange={handleCodeMarkerChange}
        />
      </div>

      <CodeEditorPanel
        algorithm={selected?.algorithm ?? null}
        isPlaying={isPlaying}
        speed={speed}
        activeCodeMarker={activeCodeMarker}
        stepLogs={stepLogs}
        onTogglePlay={() => setIsPlaying(p => !p)}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />
    </div>
  );
};

export default Index;
