

# Algorithm Visualizer — Master Format Compliance Overhaul

## Current vs Required Mapping

Based on the user's master format, here are ALL mismatches between current `vizType` and what is required:

### vizType Fixes in `algorithms.ts`

| Algorithm | Current | Required | Notes |
|-----------|---------|----------|-------|
| Hamiltonian Cycles | `grid` | `graph` | Graph problem, not grid |
| Binary Search Tree | `graph` | `tree` (NEW) | Needs tree layout, not circular graph |
| Binary Tree Traversal | `graph` | `tree` (NEW) | Needs tree layout |
| Lowest Common Ancestor | `graph` | `tree` (NEW) | Needs tree layout |
| Heapsort | `bars` | `tree` (NEW) | Heap tree visualization |
| Maximum Sum Path | `graph` | `dp-table` | Triangle DP, not graph |
| Longest Increasing Subsequence | `dp-table` | `bars` | Array visualization |
| Miller-Rabin | `custom` | `dp-table` | Show modular exponentiation steps |
| Bellman-Ford | `graph` | `graph` | OK, but needs proper relaxation viz |

### New vizType Values Needed

The user's master format defines visualization types that don't exist yet. However, creating 8+ new visualization components would be impractical. Instead, we'll handle these within existing components using algorithm-aware rendering:

- `tree` — New component: `TreeViz.tsx` for BST, Binary Tree Traversal, LCA, Heapsort
- All sorting algorithms stay as `bars` (Merge Sort, QuickSort, Counting Sort, etc. — user's `split-merge`/`pivot-partition` are conceptual; the bar chart already shows the real array state with range/pivot highlighting)

## Implementation Steps

### Step 1: Create `TreeViz.tsx` (NEW component)

A tree visualization component with hierarchical node layout (parent-child positioning, not circular). Supports:
- **BST**: Insert values one by one, highlight search path
- **Binary Tree Traversal**: Show inorder/preorder/postorder visit order
- **LCA**: Highlight paths to two target nodes, show common ancestor
- **Heapsort**: Show heap as tree, animate heapify + extract operations

### Step 2: Fix `algorithms.ts` vizType Mappings

- `Hamiltonian Cycles` → `graph`
- `Binary Search Tree` → `tree`
- `Binary Tree Traversal` → `tree`
- `Lowest Common Ancestor` → `tree`
- `Heapsort` → `tree`
- `Maximum Sum Path` → `dp-table`
- `Longest Increasing Subsequence` → `bars`
- `Miller-Rabin` → `dp-table`
- Add `'tree'` to the `VizType` union type

### Step 3: Fix `VisualizationPanel.tsx`

Add `case "tree"` routing to the new `TreeViz` component.

### Step 4: Fix `DPTableViz.tsx` — Add Missing Step Generators

- **Floyd-Warshall**: V×V distance matrix, iterate k→i→j, highlight current cell + intermediary k
- **Maximum Sum Path**: Triangle DP, bottom-up filling, highlight optimal path
- **Miller-Rabin**: Show modular exponentiation steps (base, power, result) per witness
- **Freivalds**: Fix existing fallback (`fibSteps(10)` → actual matrix verification steps)

### Step 5: Fix `GraphViz.tsx` — Algorithm-Specific Logic

Currently many algorithms fall back to generic `bfsSteps`/`dfsSteps`. Fix:

- **Hamiltonian Cycle**: Add `hamiltonianSteps()` — backtracking path on graph with cycle detection
- **Tarjan SCC**: Show disc/low values as node labels, color nodes by SCC component
- **Bridge Finding**: Highlight bridge edges in distinct color, show disc/low values
- **Bipartiteness**: 2-coloring with two distinct node colors
- **PageRank**: Iterative PR value updates shown as node labels, node size changes
- **Stable Matching**: Bipartite layout with proposal/acceptance edge animation
- **Cycle Detection**: Linked-list-like graph with slow/fast pointer animation
- **Prim's MST**: Fix edge-tracking bug (lines 145-154) — track parent array properly

### Step 6: Fix `RecursionTreeViz.tsx` — Sum of Subsets

Replace `buildFactorialTree(4)` fallback with actual `buildSubsetSumTree(set, target)`:
- Binary decision tree (include/exclude branches)
- Labels show `[sum, idx]`
- Highlight found subsets in green, pruned branches in red

### Step 7: Fix `GridViz.tsx` — Remove Wrong Mapping

Remove `Sum of Subsets` from grid steps (line 198) — it uses `solveNQueens(6)` which is completely wrong. Sum of Subsets is already correctly mapped to `recursion-tree`.

## Files Changed

| File | Change |
|------|--------|
| `src/data/algorithms.ts` | Fix VizType union, fix 8 vizType values |
| `src/components/visualizations/TreeViz.tsx` | NEW — tree layout for BST, traversal, LCA, heapsort |
| `src/components/VisualizationPanel.tsx` | Add `tree` case |
| `src/components/visualizations/DPTableViz.tsx` | Add Floyd-Warshall, Max Sum Path, Miller-Rabin, fix Freivalds |
| `src/components/visualizations/GraphViz.tsx` | Add Hamiltonian, Tarjan, Bridge, Bipartite, PageRank, Stable Matching, Cycle Detection logic; fix Prim's bug |
| `src/components/visualizations/RecursionTreeViz.tsx` | Add subset sum tree |
| `src/components/visualizations/GridViz.tsx` | Remove Sum of Subsets entry |

