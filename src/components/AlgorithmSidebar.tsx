import { useState } from "react";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import { algorithmCategories, AlgorithmInfo } from "@/data/algorithms";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selected: { category: string; algorithm: AlgorithmInfo } | null;
  onSelect: (category: string, algo: AlgorithmInfo) => void;
}

const categoryIcons: Record<string, string> = {
  "Backtracking": "🔙",
  "Branch and Bound": "🌿",
  "Brute Force": "💪",
  "Divide and Conquer": "⚔️",
  "Dynamic Programming": "📊",
  "Greedy": "🏃",
  "Simple Recursive": "🔄",
  "Uncategorized": "📦",
};

export function AlgorithmSidebar({ selected, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["Brute Force"]));

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filtered = Object.entries(algorithmCategories).reduce(
    (acc, [cat, algos]) => {
      const f = algos.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      );
      if (f.length > 0) acc[cat] = f;
      return acc;
    },
    {} as Record<string, AlgorithmInfo[]>
  );

  return (
    <div className="w-72 h-full flex flex-col glass-strong rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground tracking-wide">
            ALGORITHMS
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/50 border border-border/30 rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Algorithm List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {Object.entries(filtered).map(([cat, algos]) => (
          <div key={cat}>
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform duration-200 ${expandedCats.has(cat) ? "rotate-90" : ""}`}
              />
              <span>{categoryIcons[cat] || "📁"}</span>
              <span>{cat}</span>
              <span className="ml-auto text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full">
                {algos.length}
              </span>
            </button>
            <AnimatePresence>
              {expandedCats.has(cat) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {algos.map((algo) => {
                    const isActive =
                      selected?.algorithm.name === algo.name &&
                      selected?.category === cat;
                    return (
                      <button
                        key={algo.name}
                        onClick={() => onSelect(cat, algo)}
                        className={`w-full text-left px-4 pl-10 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary/15 text-primary font-medium glow-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                        }`}
                      >
                        {algo.name}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
