import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Code2, BarChart3, GitBranch, Sparkles, Grid3X3, TreeDeciduous, Activity, Layers, Table, TrendingUp, Repeat, Box } from "lucide-react";

const categories = [
  { name: "Backtracking", icon: Grid3X3, count: 4, desc: "Explore all possibilities and backtrack when needed" },
  { name: "Branch and Bound", icon: TreeDeciduous, count: 4, desc: "Efficiently search optimal solutions with pruning" },
  { name: "Brute Force", icon: Activity, count: 14, desc: "Try all possibilities to find solution" },
  { name: "Divide & Conquer", icon: Layers, count: 5, desc: "Break problems into smaller parts" },
  { name: "Dynamic Programming", icon: Table, count: 16, desc: "Store results to optimize repeated work" },
  { name: "Greedy", icon: TrendingUp, count: 5, desc: "Make best choice at each step" },
  { name: "Simple Recursive", icon: Repeat, count: 4, desc: "Solve problems using recursive calls" },
  { name: "Uncategorized", icon: Box, count: 7, desc: "Special and advanced algorithms" },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const Home = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.85]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden scroll-smooth"
      style={{
        background:
          "linear-gradient(160deg, hsl(150,30%,2%) 0%, hsl(155,25%,5%) 30%, hsl(150,20%,8%) 60%, hsl(145,30%,4%) 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.15] blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(145,60%,35%) 0%, transparent 70%)",
          top: "-8%",
          right: "-5%",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.12] blur-[100px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(160,50%,30%) 0%, transparent 70%)",
          bottom: "-5%",
          left: "-3%",
        }}
      />

      {/* Floating particles — reduced for perf */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: "hsl(145,60%,50%)",
            top: `${18 + i * 18}%`,
            left: `${12 + i * 20}%`,
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* ─── Hero Section ─── */}
      {step === 1 && (
        <motion.section
          style={{ opacity: heroOpacity }}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl px-5 sm:px-8 pt-[12vh] sm:pt-[14vh] pb-12"
      >
        {/* Glass card */}
        <motion.div
          className="w-full rounded-[20px] px-8 py-10 sm:px-12 sm:py-14"
          style={{
            background: "hsl(150,20%,8%,0.55)",
            backdropFilter: "blur(30px)",
            border: "1px solid hsl(150,20%,20%,0.35)",
            boxShadow:
              "0 0 60px hsl(145,60%,45%,0.06), 0 25px 50px hsl(0,0%,0%,0.4), inset 0 1px 0 hsl(150,20%,30%,0.15)",
          }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
          }}
        >
          {/* Icon cluster */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-7"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
            }}
          >
            {[BarChart3, GitBranch, Code2].map((Icon, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "hsl(145,60%,45%,0.1)",
                  border: "1px solid hsl(145,60%,45%,0.2)",
                }}
              >
                <Icon className="w-5 h-5 text-primary" />
              </div>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
            style={{
              color: "hsl(150,20%,93%)",
              textShadow: "0 0 30px hsl(145,60%,45%,0.2)",
              letterSpacing: "-0.025em",
            }}
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
            }}
          >
            Algorithm Visualizer
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-sm sm:text-base md:text-lg mb-9 max-w-sm sm:max-w-md mx-auto leading-relaxed"
            style={{ color: "hsl(150,10%,55%)" }}
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
            }}
          >
            Visualize algorithms step-by-step in an interactive way
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => setStep(2)}
            className="group relative inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(145,60%,40%) 0%, hsl(160,55%,35%) 100%)",
              color: "hsl(150,30%,4%)",
              boxShadow: "0 0 25px hsl(145,60%,45%,0.25), 0 4px 15px hsl(0,0%,0%,0.3)",
            }}
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 40px hsl(145,60%,45%,0.35), 0 8px 25px hsl(0,0%,0%,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Play className="w-4 h-4" />
            Start Visualizing
            <Sparkles className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2.5 mt-7"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.55, ease }}
        >
          {["70+ Algorithms", "Step-by-Step", "Interactive", "Multi-Language"].map(
            (label) => (
              <span
                key={label}
                className="text-[11px] sm:text-xs font-medium px-3 sm:px-3.5 py-1.5 rounded-full"
                style={{
                  background: "hsl(150,20%,8%,0.5)",
                  border: "1px solid hsl(150,15%,18%,0.5)",
                  color: "hsl(150,10%,55%)",
                }}
              >
                {label}
              </span>
            )
          )}
        </motion.div>
      </motion.section>
      )}

      {/* ─── Categories Section ─── */}
      {step === 2 && (
        <>
          {/* Skip Button */}
          <motion.div 
            className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={() => navigate("/visualizer")}
              className="group flex flex-row items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "hsl(150,20%,8%,0.65)",
                border: "1px solid hsl(145,60%,45%,0.3)",
                color: "hsl(145,60%,45%)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 20px hsl(0,0%,0%,0.2), inset 0 1px 0 hsl(145,60%,45%,0.15)",
              }}
            >
              Skip
              <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>

          <motion.section
            className="relative z-10 w-full max-w-4xl px-5 sm:px-8 pt-[12vh] sm:pt-[14vh] pb-20"
            initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
      >
        <h2
          className="text-lg sm:text-xl font-semibold text-center mb-8 tracking-tight"
          style={{ color: "hsl(150,15%,65%)" }}
        >
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.name}
                onClick={() => navigate("/visualizer")}
                className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-[16px] cursor-pointer"
                style={{
                  background: "hsl(150,20%,8%,0.5)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid hsl(150,20%,18%,0.3)",
                  boxShadow: "0 4px 20px hsl(0,0%,0%,0.2)",
                  willChange: "transform",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease }}
                whileHover={{
                  y: -6,
                  rotateX: 2,
                  rotateY: -1,
                  boxShadow: "0 0 25px hsl(145,60%,45%,0.15), 0 12px 30px hsl(0,0%,0%,0.35), inset 0 1px 0 hsl(145,60%,45%,0.1)",
                  borderColor: "hsl(145,60%,45%,0.4)",
                  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "hsl(145,60%,45%,0.1)",
                    border: "1px solid hsl(145,60%,45%,0.15)",
                  }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium leading-tight" style={{ color: "hsl(150,15%,80%)" }}>
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-[11px] leading-snug text-center" style={{ color: "hsl(150,10%,48%)" }}>
                  {cat.desc}
                </span>
                <span className="text-[10px] sm:text-xs font-medium" style={{ color: "hsl(145,40%,45%,0.7)" }}>
                  {cat.count} algorithms
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>
        </>
      )}
    </div>
  );
};

export default Home;
