export type VizType = 'bars' | 'grid' | 'graph' | 'dp-table' | 'recursion-tree' | 'text' | 'points' | 'maze' | 'tree' | 'custom';

export interface AlgorithmInfo {
  name: string;
  vizType: VizType;
  description: string;
  complexity: { time: string; space: string };
  code: { java: string; c: string; javascript: string };
}

const c = (name: string, java: string, cCode: string, js: string) => ({ java: `// ${name}\n${java}`, c: `// ${name}\n${cCode}`, javascript: `// ${name}\n${js}` });

export const algorithmCategories: Record<string, AlgorithmInfo[]> = {
  "Backtracking": [
    {
      name: "Hamiltonian Cycles", vizType: "graph",
      description: "Find a cycle visiting every vertex exactly once",
      complexity: { time: "O(n!)", space: "O(n)" },
      code: c("Hamiltonian Cycle",
        `public class HamiltonianCycle {
    boolean isSafe(int v, int[][] graph, int[] path, int pos) {
        if (graph[path[pos - 1]][v] == 0) return false;
        for (int i = 0; i < pos; i++)
            if (path[i] == v) return false;
        return true;
    }
    boolean solve(int[][] graph, int[] path, int pos) {
        int V = graph.length;
        if (pos == V) return graph[path[pos - 1]][path[0]] == 1;
        for (int v = 1; v < V; v++) {
            if (isSafe(v, graph, path, pos)) {
                path[pos] = v;
                if (solve(graph, path, pos + 1)) return true;
                path[pos] = -1;
            }
        }
        return false;
    }
    int[] hamiltonianCycle(int[][] graph) {
        int[] path = new int[graph.length];
        java.util.Arrays.fill(path, -1);
        path[0] = 0;
        return solve(graph, path, 1) ? path : null;
    }
}`,
        `#include <stdbool.h>
#include <stdio.h>
#define V 5
int path[V];
bool isSafe(int v, int graph[V][V], int pos) {
    if (graph[path[pos-1]][v] == 0) return false;
    for (int i = 0; i < pos; i++)
        if (path[i] == v) return false;
    return true;
}
bool solve(int graph[V][V], int pos) {
    if (pos == V) return graph[path[pos-1]][path[0]] == 1;
    for (int v = 1; v < V; v++) {
        if (isSafe(v, graph, pos)) {
            path[pos] = v;
            if (solve(graph, pos + 1)) return true;
            path[pos] = -1;
        }
    }
    return false;
}
bool hamiltonianCycle(int graph[V][V]) {
    for (int i = 0; i < V; i++) path[i] = -1;
    path[0] = 0;
    return solve(graph, 1);
}`,
        `function hamiltonianCycle(graph) {
    const V = graph.length;
    const path = Array(V).fill(-1);
    path[0] = 0;
    function isSafe(v, pos) {
        if (!graph[path[pos-1]][v]) return false;
        return !path.slice(0, pos).includes(v);
    }
    function solve(pos) {
        if (pos === V) return !!graph[path[pos-1]][path[0]];
        for (let v = 1; v < V; v++) {
            if (isSafe(v, pos)) {
                path[pos] = v;
                if (solve(pos + 1)) return true;
                path[pos] = -1;
            }
        }
        return false;
    }
    return solve(1) ? path : null;
}`)
    },
    {
      name: "Knight's Tour Problem", vizType: "grid",
      description: "Find a path for a knight to visit every square",
      complexity: { time: "O(8^(n^2))", space: "O(n^2)" },
      code: c("Knight's Tour",
        `public class KnightsTour {
    static int[] dx = {2,1,-1,-2,-2,-1,1,2};
    static int[] dy = {1,2,2,1,-1,-2,-2,-1};
    static boolean solve(int[][] board, int x, int y, int move, int n) {
        if (move == n * n) return true;
        for (int i = 0; i < 8; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            if (nx >= 0 && nx < n && ny >= 0 && ny < n && board[nx][ny] == -1) {
                board[nx][ny] = move;
                if (solve(board, nx, ny, move + 1, n)) return true;
                board[nx][ny] = -1;
            }
        }
        return false;
    }
    static int[][] knightsTour(int n) {
        int[][] board = new int[n][n];
        for (int i = 0; i < n; i++) java.util.Arrays.fill(board[i], -1);
        board[0][0] = 0;
        return solve(board, 0, 0, 1, n) ? board : null;
    }
}`,
        `#include <stdbool.h>
#define N 8
int board[N][N];
int dx[] = {2,1,-1,-2,-2,-1,1,2};
int dy[] = {1,2,2,1,-1,-2,-2,-1};
bool solve(int x, int y, int move) {
    if (move == N*N) return true;
    for (int i = 0; i < 8; i++) {
        int nx = x+dx[i], ny = y+dy[i];
        if (nx>=0 && nx<N && ny>=0 && ny<N && board[nx][ny]==-1) {
            board[nx][ny] = move;
            if (solve(nx, ny, move+1)) return true;
            board[nx][ny] = -1;
        }
    }
    return false;
}
bool knightsTour(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            board[i][j] = -1;
    board[0][0] = 0;
    return solve(0, 0, 1);
}`,
        `function knightsTour(n) {
    const board = Array.from({length:n}, ()=>Array(n).fill(-1));
    const dx = [2,1,-1,-2,-2,-1,1,2];
    const dy = [1,2,2,1,-1,-2,-2,-1];
    board[0][0] = 0;
    function solve(x, y, move) {
        if (move === n*n) return true;
        for (let i = 0; i < 8; i++) {
            const nx = x+dx[i], ny = y+dy[i];
            if (nx>=0 && nx<n && ny>=0 && ny<n && board[nx][ny]===-1) {
                board[nx][ny] = move;
                if (solve(nx, ny, move+1)) return true;
                board[nx][ny] = -1;
            }
        }
        return false;
    }
    solve(0, 0, 1);
    return board.every(row => row.every(cell => cell >= 0)) ? board : null;
}`)
    },
    {
      name: "N-Queens Problem", vizType: "grid",
      description: "Place N queens on an NxN board with no conflicts",
      complexity: { time: "O(n!)", space: "O(n²)" },
      code: c("N-Queens",
        `public class NQueens {
    static boolean isSafe(int[][] board, int row, int col, int n) {
        for (int i = 0; i < col; i++) if (board[row][i] == 1) return false;
        for (int i=row,j=col; i>=0&&j>=0; i--,j--) if (board[i][j]==1) return false;
        for (int i=row,j=col; i<n&&j>=0; i++,j--) if (board[i][j]==1) return false;
        return true;
    }
    static boolean solve(int[][] board, int col, int n) {
        if (col >= n) return true;
        for (int i = 0; i < n; i++) {
            if (isSafe(board, i, col, n)) {
                board[i][col] = 1;
                if (solve(board, col+1, n)) return true;
                board[i][col] = 0;
            }
        }
        return false;
    }
}`,
        `#include <stdbool.h>
#define N 8
int board[N][N];
bool isSafe(int row, int col) {
    for (int i=0; i<col; i++) if (board[row][i]) return false;
    for (int i=row,j=col; i>=0&&j>=0; i--,j--) if (board[i][j]) return false;
    for (int i=row,j=col; i<N&&j>=0; i++,j--) if (board[i][j]) return false;
    return true;
}
bool solve(int col) {
    if (col >= N) return true;
    for (int i = 0; i < N; i++) {
        if (isSafe(i, col)) {
            board[i][col] = 1;
            if (solve(col+1)) return true;
            board[i][col] = 0;
        }
    }
    return false;
}`,
        `function solveNQueens(n) {
    const board = Array.from({length:n}, ()=>Array(n).fill(0));
    function isSafe(row, col) {
        for (let i=0; i<col; i++) if (board[row][i]) return false;
        for (let i=row,j=col; i>=0&&j>=0; i--,j--) if (board[i][j]) return false;
        for (let i=row,j=col; i<n&&j>=0; i++,j--) if (board[i][j]) return false;
        return true;
    }
    function solve(col) {
        if (col >= n) return true;
        for (let i = 0; i < n; i++) {
            if (isSafe(i, col)) {
                board[i][col] = 1;
                if (solve(col+1)) return true;
                board[i][col] = 0;
            }
        }
        return false;
    }
    solve(0);
    return board;
}`)
    },
    {
      name: "Sum of Subsets", vizType: "recursion-tree",
      description: "Find subsets that sum to a target value",
      complexity: { time: "O(2^n)", space: "O(n)" },
      code: c("Sum of Subsets",
        `public class SubsetSum {
    static void solve(int[] set, int n, int sum, int idx, boolean[] include) {
        if (sum == 0) { printSubset(set, include); return; }
        if (idx >= n || sum < 0) return;
        include[idx] = true;
        solve(set, n, sum - set[idx], idx + 1, include);
        include[idx] = false;
        solve(set, n, sum, idx + 1, include);
    }
    static void subsetSum(int[] set, int target) {
        solve(set, set.length, target, 0, new boolean[set.length]);
    }
}`,
        `void solve(int set[], int n, int sum, int idx, int include[]) {
    if (sum == 0) { printSubset(set, include, n); return; }
    if (idx >= n || sum < 0) return;
    include[idx] = 1;
    solve(set, n, sum - set[idx], idx + 1, include);
    include[idx] = 0;
    solve(set, n, sum, idx + 1, include);
}
void subsetSum(int set[], int n, int target) {
    int include[32] = {0};
    solve(set, n, target, 0, include);
}`,
        `function subsetSum(set, target) {
    const results = [];
    function solve(idx, current, sum) {
        if (sum === target) { results.push([...current]); return; }
        if (idx >= set.length || sum > target) return;
        current.push(set[idx]);
        solve(idx + 1, current, sum + set[idx]);
        current.pop();
        solve(idx + 1, current, sum);
    }
    solve(0, [], 0);
    return results;
}`)
    },
  ],
  "Branch and Bound": [
    {
      name: "Binary Search", vizType: "bars",
      description: "Search sorted array by halving the search space",
      complexity: { time: "O(log n)", space: "O(1)" },
      code: c("Binary Search",
        `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}`,
        `int binarySearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        `function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`)
    },
    {
      name: "Binary Search Tree", vizType: "tree",
      description: "Tree structure maintaining sorted order",
      complexity: { time: "O(log n)", space: "O(n)" },
      code: c("Binary Search Tree",
        `public class BST {
    int val; BST left, right;
    BST(int val) { this.val = val; }
    BST insert(BST root, int val) {
        if (root == null) return new BST(val);
        if (val < root.val) root.left = insert(root.left, val);
        else root.right = insert(root.right, val);
        return root;
    }
    BST search(BST root, int val) {
        if (root == null || root.val == val) return root;
        return val < root.val ? search(root.left, val) : search(root.right, val);
    }
}`,
        `typedef struct Node { int val; struct Node *left, *right; } Node;
Node* newNode(int val) {
    Node* n = malloc(sizeof(Node));
    n->val = val; n->left = n->right = NULL;
    return n;
}
Node* insert(Node* root, int val) {
    if (!root) return newNode(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`,
        `class BST {
    constructor(val) { this.val = val; this.left = this.right = null; }
    insert(val) {
        if (val < this.val)
            this.left ? this.left.insert(val) : (this.left = new BST(val));
        else
            this.right ? this.right.insert(val) : (this.right = new BST(val));
    }
    search(val) {
        if (this.val === val) return this;
        if (val < this.val) return this.left?.search(val) ?? null;
        return this.right?.search(val) ?? null;
    }
}`)
    },
    {
      name: "Depth-Limited Search", vizType: "graph",
      description: "DFS with a depth limit to avoid infinite paths",
      complexity: { time: "O(b^l)", space: "O(bl)" },
      code: c("Depth-Limited Search",
        `public class DLS {
    boolean dls(int node, int target, int limit, List<List<Integer>> adj, boolean[] visited) {
        if (node == target) return true;
        if (limit <= 0) return false;
        visited[node] = true;
        for (int next : adj.get(node))
            if (!visited[next] && dls(next, target, limit-1, adj, visited))
                return true;
        return false;
    }
}`,
        `bool dls(int node, int target, int limit, int adj[][MAX], int n, bool visited[]) {
    if (node == target) return true;
    if (limit <= 0) return false;
    visited[node] = true;
    for (int i = 0; i < n; i++)
        if (adj[node][i] && !visited[i] && dls(i, target, limit-1, adj, n, visited))
            return true;
    return false;
}`,
        `function depthLimitedSearch(adj, start, target, limit) {
    const visited = new Set();
    function dls(node, depth) {
        if (node === target) return true;
        if (depth >= limit) return false;
        visited.add(node);
        for (const next of adj[node])
            if (!visited.has(next) && dls(next, depth + 1)) return true;
        return false;
    }
    return dls(start, 0);
}`)
    },
    {
      name: "Topological Sort", vizType: "graph",
      description: "Linear ordering of DAG vertices",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("Topological Sort (Kahn's)",
        `public class TopSort {
    public static List<Integer> sort(int V, List<List<Integer>> adj) {
        int[] indegree = new int[V];
        for (var neighbors : adj)
            for (int v : neighbors) indegree[v]++;
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < V; i++)
            if (indegree[i] == 0) q.add(i);
        List<Integer> result = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            result.add(u);
            for (int v : adj.get(u))
                if (--indegree[v] == 0) q.add(v);
        }
        return result;
    }
}`,
        `void topSort(int adj[][MAX], int n) {
    int indegree[MAX] = {0}, queue[MAX], front=0, rear=0;
    for (int i=0; i<n; i++)
        for (int j=0; j<n; j++)
            if (adj[i][j]) indegree[j]++;
    for (int i=0; i<n; i++)
        if (indegree[i]==0) queue[rear++] = i;
    while (front < rear) {
        int u = queue[front++];
        printf("%d ", u);
        for (int v=0; v<n; v++)
            if (adj[u][v] && --indegree[v]==0) queue[rear++] = v;
    }
}`,
        `function topologicalSort(adj) {
    const V = adj.length;
    const indegree = Array(V).fill(0);
    adj.forEach(neighbors => neighbors.forEach(v => indegree[v]++));
    const queue = [];
    for (let i = 0; i < V; i++) if (indegree[i] === 0) queue.push(i);
    const result = [];
    while (queue.length) {
        const u = queue.shift();
        result.push(u);
        for (const v of adj[u])
            if (--indegree[v] === 0) queue.push(v);
    }
    return result;
}`)
    },
  ],
  "Brute Force": [
    {
      name: "Binary Tree Traversal", vizType: "tree",
      description: "Visit all nodes in a binary tree (inorder, preorder, postorder)",
      complexity: { time: "O(n)", space: "O(h)" },
      code: c("Binary Tree Traversal",
        `public class TreeTraversal {
    void inorder(TreeNode root) {
        if (root == null) return;
        inorder(root.left);
        System.out.print(root.val + " ");
        inorder(root.right);
    }
    void preorder(TreeNode root) {
        if (root == null) return;
        System.out.print(root.val + " ");
        preorder(root.left);
        preorder(root.right);
    }
}`,
        `void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    printf("%d ", root->val);
    inorder(root->right);
}
void preorder(Node* root) {
    if (!root) return;
    printf("%d ", root->val);
    preorder(root->left);
    preorder(root->right);
}`,
        `function inorder(root) {
    if (!root) return [];
    return [...inorder(root.left), root.val, ...inorder(root.right)];
}
function preorder(root) {
    if (!root) return [];
    return [root.val, ...preorder(root.left), ...preorder(root.right)];
}`)
    },
    {
      name: "Bipartiteness Test", vizType: "graph",
      description: "Check if a graph is bipartite using BFS coloring",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("Bipartiteness Test",
        `public class Bipartite {
    public static boolean isBipartite(int[][] adj, int V) {
        int[] color = new int[V];
        Arrays.fill(color, -1);
        Queue<Integer> q = new LinkedList<>();
        color[0] = 0; q.add(0);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v = 0; v < V; v++) {
                if (adj[u][v] == 1) {
                    if (color[v] == -1) { color[v] = 1-color[u]; q.add(v); }
                    else if (color[v] == color[u]) return false;
                }
            }
        }
        return true;
    }
}`,
        `bool isBipartite(int adj[][MAX], int V) {
    int color[MAX]; memset(color, -1, sizeof(color));
    int queue[MAX], front=0, rear=0;
    color[0] = 0; queue[rear++] = 0;
    while (front < rear) {
        int u = queue[front++];
        for (int v=0; v<V; v++) {
            if (adj[u][v]) {
                if (color[v]==-1) { color[v]=1-color[u]; queue[rear++]=v; }
                else if (color[v]==color[u]) return false;
            }
        }
    }
    return true;
}`,
        `function isBipartite(adj) {
    const V = adj.length;
    const color = Array(V).fill(-1);
    const queue = [0]; color[0] = 0;
    while (queue.length) {
        const u = queue.shift();
        for (const v of adj[u]) {
            if (color[v] === -1) { color[v] = 1-color[u]; queue.push(v); }
            else if (color[v] === color[u]) return false;
        }
    }
    return true;
}`)
    },
    {
      name: "Breadth-First Search", vizType: "graph",
      description: "Explore graph level by level",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("BFS",
        `import java.util.*;
public class BFS {
    public static void bfs(List<List<Integer>> adj, int start) {
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> queue = new LinkedList<>();
        visited[start] = true; queue.add(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            System.out.print(node + " ");
            for (int nb : adj.get(node))
                if (!visited[nb]) { visited[nb] = true; queue.add(nb); }
        }
    }
}`,
        `void bfs(int adj[][MAX], int n, int start) {
    bool visited[MAX] = {false};
    int queue[MAX], front=0, rear=0;
    visited[start] = true; queue[rear++] = start;
    while (front < rear) {
        int node = queue[front++];
        printf("%d ", node);
        for (int i=0; i<n; i++)
            if (adj[node][i] && !visited[i]) { visited[i]=true; queue[rear++]=i; }
    }
}`,
        `function bfs(adjList, start) {
    const visited = new Set([start]);
    const queue = [start], order = [];
    while (queue.length) {
        const node = queue.shift();
        order.push(node);
        for (const nb of adjList[node])
            if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
    return order;
}`)
    },
    {
      name: "Bridge Finding", vizType: "graph",
      description: "Find edges whose removal disconnects the graph",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("Bridge Finding (Tarjan)",
        `public class Bridges {
    int timer = 0;
    void dfs(int u, int parent, List<List<Integer>> adj, int[] disc, int[] low, boolean[] vis) {
        vis[u] = true; disc[u] = low[u] = timer++;
        for (int v : adj.get(u)) {
            if (!vis[v]) {
                dfs(v, u, adj, disc, low, vis);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u])
                    System.out.println("Bridge: " + u + "-" + v);
            } else if (v != parent)
                low[u] = Math.min(low[u], disc[v]);
        }
    }
}`,
        `int timer = 0;
void dfs(int u, int parent, int adj[][MAX], int n, int disc[], int low[], bool vis[]) {
    vis[u] = true; disc[u] = low[u] = timer++;
    for (int v = 0; v < n; v++) {
        if (!adj[u][v]) continue;
        if (!vis[v]) {
            dfs(v, u, adj, n, disc, low, vis);
            if (low[v] < low[u]) low[u] = low[v];
            if (low[v] > disc[u]) printf("Bridge: %d-%d\\n", u, v);
        } else if (v != parent && disc[v] < low[u])
            low[u] = disc[v];
    }
}`,
        `function findBridges(adj) {
    const n = adj.length, disc = Array(n).fill(-1), low = Array(n).fill(-1);
    const bridges = []; let timer = 0;
    function dfs(u, parent) {
        disc[u] = low[u] = timer++;
        for (const v of adj[u]) {
            if (disc[v] === -1) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) bridges.push([u, v]);
            } else if (v !== parent) low[u] = Math.min(low[u], disc[v]);
        }
    }
    for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i, -1);
    return bridges;
}`)
    },
    {
      name: "Bubble Sort", vizType: "bars",
      description: "Repeatedly swap adjacent elements if out of order",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Bubble Sort",
        `public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n-1; i++)
            for (int j = 0; j < n-i-1; j++)
                if (arr[j] > arr[j+1]) {
                    int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
                }
    }
}`,
        `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
            }
}`,
        `function bubbleSort(arr) {
    const a = [...arr];
    for (let i = 0; i < a.length-1; i++)
        for (let j = 0; j < a.length-i-1; j++)
            if (a[j] > a[j+1]) [a[j], a[j+1]] = [a[j+1], a[j]];
    return a;
}`)
    },
    {
      name: "Comb Sort", vizType: "bars",
      description: "Improvement on bubble sort using gap sequences",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Comb Sort",
        `public class CombSort {
    public static void sort(int[] arr) {
        int n = arr.length, gap = n;
        boolean swapped = true;
        while (gap > 1 || swapped) {
            gap = Math.max(1, (int)(gap / 1.3));
            swapped = false;
            for (int i = 0; i + gap < n; i++)
                if (arr[i] > arr[i+gap]) {
                    int t = arr[i]; arr[i] = arr[i+gap]; arr[i+gap] = t;
                    swapped = true;
                }
        }
    }
}`,
        `void combSort(int arr[], int n) {
    int gap = n; bool swapped = true;
    while (gap > 1 || swapped) {
        gap = gap * 10 / 13; if (gap < 1) gap = 1;
        swapped = false;
        for (int i = 0; i+gap < n; i++)
            if (arr[i] > arr[i+gap]) {
                int t=arr[i]; arr[i]=arr[i+gap]; arr[i+gap]=t;
                swapped = true;
            }
    }
}`,
        `function combSort(arr) {
    const a = [...arr]; let gap = a.length, swapped = true;
    while (gap > 1 || swapped) {
        gap = Math.max(1, Math.floor(gap / 1.3));
        swapped = false;
        for (let i = 0; i+gap < a.length; i++)
            if (a[i] > a[i+gap]) { [a[i], a[i+gap]] = [a[i+gap], a[i]]; swapped = true; }
    }
    return a;
}`)
    },
    {
      name: "Cycle Sort", vizType: "bars",
      description: "Optimal in-place sort minimizing writes",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Cycle Sort",
        `public class CycleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int cs = 0; cs < n-1; cs++) {
            int item = arr[cs], pos = cs;
            for (int i = cs+1; i < n; i++) if (arr[i] < item) pos++;
            if (pos == cs) continue;
            while (item == arr[pos]) pos++;
            int t = arr[pos]; arr[pos] = item; item = t;
            while (pos != cs) {
                pos = cs;
                for (int i = cs+1; i < n; i++) if (arr[i] < item) pos++;
                while (item == arr[pos]) pos++;
                t = arr[pos]; arr[pos] = item; item = t;
            }
        }
    }
}`,
        `void cycleSort(int arr[], int n) {
    for (int cs = 0; cs < n-1; cs++) {
        int item = arr[cs], pos = cs;
        for (int i = cs+1; i < n; i++) if (arr[i] < item) pos++;
        if (pos == cs) continue;
        while (item == arr[pos]) pos++;
        int t = arr[pos]; arr[pos] = item; item = t;
        while (pos != cs) {
            pos = cs;
            for (int i = cs+1; i < n; i++) if (arr[i] < item) pos++;
            while (item == arr[pos]) pos++;
            t = arr[pos]; arr[pos] = item; item = t;
        }
    }
}`,
        `function cycleSort(arr) {
    const a = [...arr];
    for (let cs = 0; cs < a.length-1; cs++) {
        let item = a[cs], pos = cs;
        for (let i = cs+1; i < a.length; i++) if (a[i] < item) pos++;
        if (pos === cs) continue;
        while (item === a[pos]) pos++;
        [a[pos], item] = [item, a[pos]];
        while (pos !== cs) {
            pos = cs;
            for (let i = cs+1; i < a.length; i++) if (a[i] < item) pos++;
            while (item === a[pos]) pos++;
            [a[pos], item] = [item, a[pos]];
        }
    }
    return a;
}`)
    },
    {
      name: "Depth-First Search", vizType: "graph",
      description: "Explore graph as deep as possible before backtracking",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("DFS",
        `public class DFS {
    public static void dfs(List<List<Integer>> adj, int node, boolean[] visited) {
        visited[node] = true;
        System.out.print(node + " ");
        for (int nb : adj.get(node))
            if (!visited[nb]) dfs(adj, nb, visited);
    }
}`,
        `void dfs(int adj[][MAX], int n, int node, bool visited[]) {
    visited[node] = true;
    printf("%d ", node);
    for (int i = 0; i < n; i++)
        if (adj[node][i] && !visited[i]) dfs(adj, n, i, visited);
}`,
        `function dfs(adjList, start) {
    const visited = new Set(), order = [];
    function visit(node) {
        visited.add(node); order.push(node);
        for (const nb of adjList[node])
            if (!visited.has(nb)) visit(nb);
    }
    visit(start);
    return order;
}`)
    },
    {
      name: "Flood Fill", vizType: "grid",
      description: "Fill connected regions with a target color",
      complexity: { time: "O(m×n)", space: "O(m×n)" },
      code: c("Flood Fill",
        `public class FloodFill {
    public static void fill(int[][] grid, int r, int c, int newColor) {
        int oldColor = grid[r][c];
        if (oldColor == newColor) return;
        dfs(grid, r, c, oldColor, newColor);
    }
    static void dfs(int[][] grid, int r, int c, int old, int nc) {
        if (r<0||r>=grid.length||c<0||c>=grid[0].length||grid[r][c]!=old) return;
        grid[r][c] = nc;
        dfs(grid,r+1,c,old,nc); dfs(grid,r-1,c,old,nc);
        dfs(grid,r,c+1,old,nc); dfs(grid,r,c-1,old,nc);
    }
}`,
        `void floodFill(int grid[][MAX], int m, int n, int r, int c, int old, int nc) {
    if (r<0||r>=m||c<0||c>=n||grid[r][c]!=old) return;
    grid[r][c] = nc;
    floodFill(grid,m,n,r+1,c,old,nc);
    floodFill(grid,m,n,r-1,c,old,nc);
    floodFill(grid,m,n,r,c+1,old,nc);
    floodFill(grid,m,n,r,c-1,old,nc);
}`,
        `function floodFill(grid, r, c, newColor) {
    const old = grid[r][c];
    if (old === newColor) return grid;
    function fill(r, c) {
        if (r<0||r>=grid.length||c<0||c>=grid[0].length||grid[r][c]!==old) return;
        grid[r][c] = newColor;
        fill(r+1,c); fill(r-1,c); fill(r,c+1); fill(r,c-1);
    }
    fill(r, c);
    return grid;
}`)
    },
    {
      name: "Heapsort", vizType: "tree",
      description: "Sort by building and extracting from a heap",
      complexity: { time: "O(n log n)", space: "O(1)" },
      code: c("Heapsort",
        `public class HeapSort {
    static void heapify(int[] arr, int n, int i) {
        int largest = i, l = 2*i+1, r = 2*i+2;
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest != i) {
            int t = arr[i]; arr[i] = arr[largest]; arr[largest] = t;
            heapify(arr, n, largest);
        }
    }
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = n/2-1; i >= 0; i--) heapify(arr, n, i);
        for (int i = n-1; i > 0; i--) {
            int t = arr[0]; arr[0] = arr[i]; arr[i] = t;
            heapify(arr, i, 0);
        }
    }
}`,
        `void heapify(int arr[], int n, int i) {
    int largest=i, l=2*i+1, r=2*i+2;
    if (l<n && arr[l]>arr[largest]) largest=l;
    if (r<n && arr[r]>arr[largest]) largest=r;
    if (largest!=i) {
        int t=arr[i]; arr[i]=arr[largest]; arr[largest]=t;
        heapify(arr, n, largest);
    }
}
void heapSort(int arr[], int n) {
    for (int i=n/2-1; i>=0; i--) heapify(arr, n, i);
    for (int i=n-1; i>0; i--) {
        int t=arr[0]; arr[0]=arr[i]; arr[i]=t;
        heapify(arr, i, 0);
    }
}`,
        `function heapSort(arr) {
    const a = [...arr], n = a.length;
    function heapify(size, i) {
        let largest = i, l = 2*i+1, r = 2*i+2;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; heapify(size, largest); }
    }
    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(n, i);
    for (let i = n-1; i > 0; i--) { [a[0], a[i]] = [a[i], a[0]]; heapify(i, 0); }
    return a;
}`)
    },
    {
      name: "Insertion Sort", vizType: "bars",
      description: "Build sorted array one element at a time",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Insertion Sort",
        `public class InsertionSort {
    public static void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i], j = i-1;
            while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; j--; }
            arr[j+1] = key;
        }
    }
}`,
        `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i-1;
        while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = key;
    }
}`,
        `function insertionSort(arr) {
    const a = [...arr];
    for (let i = 1; i < a.length; i++) {
        const key = a[i]; let j = i-1;
        while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
        a[j+1] = key;
    }
    return a;
}`)
    },
    {
      name: "Lowest Common Ancestor", vizType: "tree",
      description: "Find lowest ancestor shared by two nodes",
      complexity: { time: "O(n)", space: "O(n)" },
      code: c("Lowest Common Ancestor",
        `public class LCA {
    TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lca(root.left, p, q);
        TreeNode right = lca(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
        `Node* lca(Node* root, Node* p, Node* q) {
    if (!root || root == p || root == q) return root;
    Node* left = lca(root->left, p, q);
    Node* right = lca(root->right, p, q);
    if (left && right) return root;
    return left ? left : right;
}`,
        `function lca(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lca(root.left, p, q);
    const right = lca(root.right, p, q);
    if (left && right) return root;
    return left || right;
}`)
    },
    {
      name: "PageRank", vizType: "graph",
      description: "Rank nodes by link importance",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("PageRank",
        `public class PageRank {
    static double[] rank(int[][] adj, int V, int iterations) {
        double[] pr = new double[V];
        Arrays.fill(pr, 1.0/V);
        double d = 0.85;
        for (int iter = 0; iter < iterations; iter++) {
            double[] newPR = new double[V];
            Arrays.fill(newPR, (1-d)/V);
            for (int u = 0; u < V; u++) {
                int outDeg = 0;
                for (int v = 0; v < V; v++) if (adj[u][v] == 1) outDeg++;
                for (int v = 0; v < V; v++)
                    if (adj[u][v] == 1) newPR[v] += d * pr[u] / outDeg;
            }
            pr = newPR;
        }
        return pr;
    }
}`,
        `void pageRank(int adj[][MAX], int V, int iter, double pr[]) {
    double d = 0.85;
    for (int i = 0; i < V; i++) pr[i] = 1.0/V;
    for (int it = 0; it < iter; it++) {
        double newPR[MAX];
        for (int i = 0; i < V; i++) newPR[i] = (1-d)/V;
        for (int u = 0; u < V; u++) {
            int out = 0;
            for (int v = 0; v < V; v++) if (adj[u][v]) out++;
            for (int v = 0; v < V; v++)
                if (adj[u][v]) newPR[v] += d * pr[u] / out;
        }
        for (int i = 0; i < V; i++) pr[i] = newPR[i];
    }
}`,
        `function pageRank(adj, iterations = 20) {
    const V = adj.length, d = 0.85;
    let pr = Array(V).fill(1/V);
    for (let iter = 0; iter < iterations; iter++) {
        const newPR = Array(V).fill((1-d)/V);
        for (let u = 0; u < V; u++) {
            const outDeg = adj[u].length;
            for (const v of adj[u]) newPR[v] += d * pr[u] / outDeg;
        }
        pr = newPR;
    }
    return pr;
}`)
    },
    {
      name: "Pancake Sort", vizType: "bars",
      description: "Sort by flipping prefixes",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Pancake Sort",
        `public class PancakeSort {
    static void flip(int[] arr, int k) {
        for (int i=0, j=k; i<j; i++,j--) {
            int t=arr[i]; arr[i]=arr[j]; arr[j]=t;
        }
    }
    public static void sort(int[] arr) {
        for (int size = arr.length; size > 1; size--) {
            int maxIdx = 0;
            for (int i = 1; i < size; i++) if (arr[i] > arr[maxIdx]) maxIdx = i;
            if (maxIdx != size-1) { flip(arr, maxIdx); flip(arr, size-1); }
        }
    }
}`,
        `void flip(int arr[], int k) {
    for (int i=0,j=k; i<j; i++,j--) { int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
}
void pancakeSort(int arr[], int n) {
    for (int size=n; size>1; size--) {
        int maxIdx=0;
        for (int i=1; i<size; i++) if (arr[i]>arr[maxIdx]) maxIdx=i;
        if (maxIdx!=size-1) { flip(arr, maxIdx); flip(arr, size-1); }
    }
}`,
        `function pancakeSort(arr) {
    const a = [...arr];
    function flip(k) { for (let i=0,j=k; i<j; i++,j--) [a[i],a[j]]=[a[j],a[i]]; }
    for (let size = a.length; size > 1; size--) {
        let maxIdx = 0;
        for (let i = 1; i < size; i++) if (a[i] > a[maxIdx]) maxIdx = i;
        if (maxIdx !== size-1) { flip(maxIdx); flip(size-1); }
    }
    return a;
}`)
    },
    {
      name: "Rabin-Karp's String Search", vizType: "text",
      description: "String matching using rolling hash",
      complexity: { time: "O(n+m)", space: "O(1)" },
      code: c("Rabin-Karp",
        `public class RabinKarp {
    static final int d = 256, q = 101;
    public static void search(String txt, String pat) {
        int m = pat.length(), n = txt.length();
        int pHash = 0, tHash = 0, h = 1;
        for (int i = 0; i < m-1; i++) h = (h*d) % q;
        for (int i = 0; i < m; i++) { pHash = (d*pHash + pat.charAt(i)) % q; tHash = (d*tHash + txt.charAt(i)) % q; }
        for (int i = 0; i <= n-m; i++) {
            if (pHash == tHash) {
                if (txt.substring(i, i+m).equals(pat))
                    System.out.println("Match at " + i);
            }
            if (i < n-m) tHash = (d*(tHash - txt.charAt(i)*h) + txt.charAt(i+m)) % q;
            if (tHash < 0) tHash += q;
        }
    }
}`,
        `#define d 256
#define q 101
void rabinKarp(char* txt, char* pat) {
    int m = strlen(pat), n = strlen(txt);
    int pHash = 0, tHash = 0, h = 1;
    for (int i = 0; i < m-1; i++) h = (h*d) % q;
    for (int i = 0; i < m; i++) { pHash = (d*pHash + pat[i]) % q; tHash = (d*tHash + txt[i]) % q; }
    for (int i = 0; i <= n-m; i++) {
        if (pHash == tHash && strncmp(txt+i, pat, m) == 0)
            printf("Match at %d\\n", i);
        if (i < n-m) { tHash = (d*(tHash - txt[i]*h) + txt[i+m]) % q; if (tHash<0) tHash+=q; }
    }
}`,
        `function rabinKarp(text, pattern) {
    const d = 256, q = 101, m = pattern.length;
    let pHash = 0, tHash = 0, h = 1;
    for (let i = 0; i < m-1; i++) h = (h*d) % q;
    for (let i = 0; i < m; i++) { pHash = (d*pHash + pattern.charCodeAt(i)) % q; tHash = (d*tHash + text.charCodeAt(i)) % q; }
    const matches = [];
    for (let i = 0; i <= text.length-m; i++) {
        if (pHash === tHash && text.substring(i, i+m) === pattern) matches.push(i);
        if (i < text.length-m) { tHash = (d*(tHash - text.charCodeAt(i)*h) + text.charCodeAt(i+m)) % q; if (tHash<0) tHash+=q; }
    }
    return matches;
}`)
    },
    {
      name: "Selection Sort", vizType: "bars",
      description: "Select minimum and place in sorted position",
      complexity: { time: "O(n²)", space: "O(1)" },
      code: c("Selection Sort",
        `public class SelectionSort {
    public static void sort(int[] arr) {
        for (int i = 0; i < arr.length-1; i++) {
            int minIdx = i;
            for (int j = i+1; j < arr.length; j++)
                if (arr[j] < arr[minIdx]) minIdx = j;
            int t = arr[minIdx]; arr[minIdx] = arr[i]; arr[i] = t;
        }
    }
}`,
        `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < n; j++) if (arr[j] < arr[minIdx]) minIdx = j;
        int t = arr[minIdx]; arr[minIdx] = arr[i]; arr[i] = t;
    }
}`,
        `function selectionSort(arr) {
    const a = [...arr];
    for (let i = 0; i < a.length-1; i++) {
        let minIdx = i;
        for (let j = i+1; j < a.length; j++) if (a[j] < a[minIdx]) minIdx = j;
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    return a;
}`)
    },
    {
      name: "Shellsort", vizType: "bars",
      description: "Generalization of insertion sort with gaps",
      complexity: { time: "O(n log²n)", space: "O(1)" },
      code: c("Shellsort",
        `public class ShellSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int gap = n/2; gap > 0; gap /= 2)
            for (int i = gap; i < n; i++) {
                int temp = arr[i], j = i;
                while (j >= gap && arr[j-gap] > temp) { arr[j] = arr[j-gap]; j -= gap; }
                arr[j] = temp;
            }
    }
}`,
        `void shellSort(int arr[], int n) {
    for (int gap = n/2; gap > 0; gap /= 2)
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j = i;
            while (j >= gap && arr[j-gap] > temp) { arr[j] = arr[j-gap]; j -= gap; }
            arr[j] = temp;
        }
}`,
        `function shellSort(arr) {
    const a = [...arr], n = a.length;
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2))
        for (let i = gap; i < n; i++) {
            const temp = a[i]; let j = i;
            while (j >= gap && a[j-gap] > temp) { a[j] = a[j-gap]; j -= gap; }
            a[j] = temp;
        }
    return a;
}`)
    },
    {
      name: "Tarjan's Strongly Connected Components", vizType: "graph",
      description: "Find SCCs using DFS",
      complexity: { time: "O(V+E)", space: "O(V)" },
      code: c("Tarjan's SCC",
        `public class TarjanSCC {
    int timer = 0;
    Stack<Integer> stack = new Stack<>();
    void dfs(int u, List<List<Integer>> adj, int[] disc, int[] low, boolean[] onStack) {
        disc[u] = low[u] = timer++;
        stack.push(u); onStack[u] = true;
        for (int v : adj.get(u)) {
            if (disc[v] == -1) { dfs(v, adj, disc, low, onStack); low[u] = Math.min(low[u], low[v]); }
            else if (onStack[v]) low[u] = Math.min(low[u], disc[v]);
        }
        if (low[u] == disc[u]) {
            System.out.print("SCC: ");
            int w;
            do { w = stack.pop(); onStack[w] = false; System.out.print(w + " "); } while (w != u);
        }
    }
}`,
        `int timer=0, stk[MAX], top=0;
bool onStack[MAX];
void dfs(int u, int adj[][MAX], int n, int disc[], int low[]) {
    disc[u] = low[u] = timer++;
    stk[top++] = u; onStack[u] = true;
    for (int v=0; v<n; v++) {
        if (!adj[u][v]) continue;
        if (disc[v]==-1) { dfs(v,adj,n,disc,low); low[u] = low[u]<low[v]?low[u]:low[v]; }
        else if (onStack[v]) low[u] = low[u]<disc[v]?low[u]:disc[v];
    }
    if (low[u]==disc[u]) {
        int w; do { w=stk[--top]; onStack[w]=false; printf("%d ",w); } while(w!=u);
    }
}`,
        `function tarjanSCC(adj) {
    const n = adj.length, disc = Array(n).fill(-1), low = Array(n).fill(-1);
    const onStack = Array(n).fill(false), stack = [], sccs = [];
    let timer = 0;
    function dfs(u) {
        disc[u] = low[u] = timer++;
        stack.push(u); onStack[u] = true;
        for (const v of adj[u]) {
            if (disc[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }
            else if (onStack[v]) low[u] = Math.min(low[u], disc[v]);
        }
        if (low[u] === disc[u]) {
            const scc = []; let w;
            do { w = stack.pop(); onStack[w] = false; scc.push(w); } while (w !== u);
            sccs.push(scc);
        }
    }
    for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);
    return sccs;
}`)
    },
  ],
  "Divide and Conquer": [
    {
      name: "Bucket Sort", vizType: "bars",
      description: "Distribute elements into buckets then sort",
      complexity: { time: "O(n+k)", space: "O(n+k)" },
      code: c("Bucket Sort",
        `public class BucketSort {
    public static void sort(float[] arr) {
        int n = arr.length;
        List<Float>[] buckets = new ArrayList[n];
        for (int i = 0; i < n; i++) buckets[i] = new ArrayList<>();
        for (float v : arr) buckets[(int)(v * n)].add(v);
        for (var b : buckets) Collections.sort(b);
        int idx = 0;
        for (var b : buckets) for (float v : b) arr[idx++] = v;
    }
}`,
        `void bucketSort(float arr[], int n) {
    // simplified for integers
    int max = 0;
    for (int i=0; i<n; i++) if (arr[i]>max) max=(int)arr[i];
    int buckets[10][100], counts[10]={0};
    for (int i=0; i<n; i++) {
        int bi = (int)(arr[i]*10/(max+1));
        buckets[bi][counts[bi]++] = (int)arr[i];
    }
    int idx = 0;
    for (int i=0; i<10; i++) {
        // sort each bucket
        for (int j=1; j<counts[i]; j++) {
            int key=buckets[i][j], k=j-1;
            while(k>=0 && buckets[i][k]>key) { buckets[i][k+1]=buckets[i][k]; k--; }
            buckets[i][k+1]=key;
        }
        for (int j=0; j<counts[i]; j++) arr[idx++]=buckets[i][j];
    }
}`,
        `function bucketSort(arr) {
    const n = arr.length, max = Math.max(...arr);
    const bucketCount = Math.ceil(Math.sqrt(n));
    const buckets = Array.from({length:bucketCount}, ()=>[]);
    for (const v of arr) buckets[Math.min(Math.floor(v/(max+1)*bucketCount), bucketCount-1)].push(v);
    return buckets.flatMap(b => b.sort((a,b) => a-b));
}`)
    },
    {
      name: "Counting Sort", vizType: "bars",
      description: "Count occurrences to determine positions",
      complexity: { time: "O(n+k)", space: "O(k)" },
      code: c("Counting Sort",
        `public class CountingSort {
    public static void sort(int[] arr) {
        int max = Arrays.stream(arr).max().getAsInt();
        int[] count = new int[max+1];
        for (int v : arr) count[v]++;
        int idx = 0;
        for (int i = 0; i <= max; i++)
            while (count[i]-- > 0) arr[idx++] = i;
    }
}`,
        `void countingSort(int arr[], int n) {
    int max = arr[0];
    for (int i=1; i<n; i++) if (arr[i]>max) max=arr[i];
    int count[max+1]; memset(count,0,sizeof(count));
    for (int i=0; i<n; i++) count[arr[i]]++;
    int idx = 0;
    for (int i=0; i<=max; i++) while (count[i]-->0) arr[idx++]=i;
}`,
        `function countingSort(arr) {
    const max = Math.max(...arr);
    const count = Array(max+1).fill(0);
    for (const v of arr) count[v]++;
    const result = [];
    for (let i = 0; i <= max; i++) while (count[i]-- > 0) result.push(i);
    return result;
}`)
    },
    {
      name: "Merge Sort", vizType: "bars",
      description: "Divide, sort halves, and merge",
      complexity: { time: "O(n log n)", space: "O(n)" },
      code: c("Merge Sort",
        `public class MergeSort {
    public static void sort(int[] arr, int l, int r) {
        if (l < r) {
            int m = (l+r)/2;
            sort(arr, l, m); sort(arr, m+1, r);
            merge(arr, l, m, r);
        }
    }
    static void merge(int[] arr, int l, int m, int r) {
        int[] L = Arrays.copyOfRange(arr, l, m+1);
        int[] R = Arrays.copyOfRange(arr, m+1, r+1);
        int i=0, j=0, k=l;
        while (i<L.length && j<R.length) arr[k++] = L[i]<=R[j] ? L[i++] : R[j++];
        while (i<L.length) arr[k++] = L[i++];
        while (j<R.length) arr[k++] = R[j++];
    }
}`,
        `void merge(int arr[], int l, int m, int r) {
    int n1=m-l+1, n2=r-m;
    int L[n1], R[n2];
    for (int i=0; i<n1; i++) L[i]=arr[l+i];
    for (int j=0; j<n2; j++) R[j]=arr[m+1+j];
    int i=0, j=0, k=l;
    while (i<n1 && j<n2) arr[k++] = L[i]<=R[j] ? L[i++] : R[j++];
    while (i<n1) arr[k++]=L[i++];
    while (j<n2) arr[k++]=R[j++];
}
void mergeSort(int arr[], int l, int r) {
    if (l<r) { int m=(l+r)/2; mergeSort(arr,l,m); mergeSort(arr,m+1,r); merge(arr,l,m,r); }
}`,
        `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const result = []; let i = 0, j = 0;
    while (i < left.length && j < right.length)
        result.push(left[i] <= right[j] ? left[i++] : right[j++]);
    return [...result, ...left.slice(i), ...right.slice(j)];
}`)
    },
    {
      name: "Pigeonhole Sort", vizType: "bars",
      description: "Distribute elements into pigeonholes",
      complexity: { time: "O(n+k)", space: "O(k)" },
      code: c("Pigeonhole Sort",
        `public class PigeonholeSort {
    public static void sort(int[] arr) {
        int min = Arrays.stream(arr).min().getAsInt();
        int max = Arrays.stream(arr).max().getAsInt();
        int range = max - min + 1;
        int[] holes = new int[range];
        for (int v : arr) holes[v - min]++;
        int idx = 0;
        for (int i = 0; i < range; i++)
            while (holes[i]-- > 0) arr[idx++] = i + min;
    }
}`,
        `void pigeonholeSort(int arr[], int n) {
    int min=arr[0], max=arr[0];
    for (int i=1; i<n; i++) { if (arr[i]<min) min=arr[i]; if (arr[i]>max) max=arr[i]; }
    int range = max-min+1, holes[range];
    memset(holes, 0, sizeof(holes));
    for (int i=0; i<n; i++) holes[arr[i]-min]++;
    int idx=0;
    for (int i=0; i<range; i++) while(holes[i]-->0) arr[idx++]=i+min;
}`,
        `function pigeonholeSort(arr) {
    const min = Math.min(...arr), max = Math.max(...arr);
    const holes = Array(max-min+1).fill(0);
    for (const v of arr) holes[v-min]++;
    const result = [];
    for (let i = 0; i < holes.length; i++) while (holes[i]-- > 0) result.push(i+min);
    return result;
}`)
    },
    {
      name: "Quicksort", vizType: "bars",
      description: "Partition around pivot and sort recursively",
      complexity: { time: "O(n log n)", space: "O(log n)" },
      code: c("Quicksort",
        `public class QuickSort {
    static int partition(int[] arr, int lo, int hi) {
        int pivot = arr[hi], i = lo-1;
        for (int j = lo; j < hi; j++)
            if (arr[j] < pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
        int t=arr[i+1]; arr[i+1]=arr[hi]; arr[hi]=t;
        return i+1;
    }
    public static void sort(int[] arr, int lo, int hi) {
        if (lo < hi) { int p = partition(arr, lo, hi); sort(arr, lo, p-1); sort(arr, p+1, hi); }
    }
}`,
        `int partition(int arr[], int lo, int hi) {
    int pivot=arr[hi], i=lo-1;
    for (int j=lo; j<hi; j++)
        if (arr[j]<pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
    int t=arr[i+1]; arr[i+1]=arr[hi]; arr[hi]=t;
    return i+1;
}
void quickSort(int arr[], int lo, int hi) {
    if (lo<hi) { int p=partition(arr,lo,hi); quickSort(arr,lo,p-1); quickSort(arr,p+1,hi); }
}`,
        `function quickSort(arr, lo=0, hi=arr.length-1) {
    if (lo < hi) {
        const pivot = arr[hi]; let i = lo-1;
        for (let j = lo; j < hi; j++)
            if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
        [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
        const p = i+1;
        quickSort(arr, lo, p-1);
        quickSort(arr, p+1, hi);
    }
    return arr;
}`)
    },
    {
      name: "Radix Sort", vizType: "bars",
      description: "Sort digit by digit from least significant",
      complexity: { time: "O(nk)", space: "O(n+k)" },
      code: c("Radix Sort",
        `public class RadixSort {
    static void countSort(int[] arr, int exp) {
        int[] output = new int[arr.length], count = new int[10];
        for (int v : arr) count[(v/exp)%10]++;
        for (int i=1; i<10; i++) count[i] += count[i-1];
        for (int i=arr.length-1; i>=0; i--) { output[count[(arr[i]/exp)%10]-1]=arr[i]; count[(arr[i]/exp)%10]--; }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
    public static void sort(int[] arr) {
        int max = Arrays.stream(arr).max().getAsInt();
        for (int exp = 1; max/exp > 0; exp *= 10) countSort(arr, exp);
    }
}`,
        `void countSort(int arr[], int n, int exp) {
    int output[n], count[10]={0};
    for (int i=0; i<n; i++) count[(arr[i]/exp)%10]++;
    for (int i=1; i<10; i++) count[i]+=count[i-1];
    for (int i=n-1; i>=0; i--) { output[count[(arr[i]/exp)%10]-1]=arr[i]; count[(arr[i]/exp)%10]--; }
    for (int i=0; i<n; i++) arr[i]=output[i];
}
void radixSort(int arr[], int n) {
    int max=arr[0]; for (int i=1; i<n; i++) if (arr[i]>max) max=arr[i];
    for (int exp=1; max/exp>0; exp*=10) countSort(arr, n, exp);
}`,
        `function radixSort(arr) {
    const a = [...arr], max = Math.max(...a);
    for (let exp = 1; Math.floor(max/exp) > 0; exp *= 10) {
        const output = Array(a.length), count = Array(10).fill(0);
        for (const v of a) count[Math.floor(v/exp) % 10]++;
        for (let i = 1; i < 10; i++) count[i] += count[i-1];
        for (let i = a.length-1; i >= 0; i--) { output[count[Math.floor(a[i]/exp)%10]-1]=a[i]; count[Math.floor(a[i]/exp)%10]--; }
        for (let i = 0; i < a.length; i++) a[i] = output[i];
    }
    return a;
}`)
    },
  ],
  "Dynamic Programming": [
    { name: "Bellman-Ford's Shortest Path", vizType: "graph", description: "Shortest paths with negative edges", complexity: { time: "O(VE)", space: "O(V)" },
      code: c("Bellman-Ford",
        `public class BellmanFord {
    public static int[] shortestPath(int V, int[][] edges, int src) {
        int[] dist = new int[V]; Arrays.fill(dist, Integer.MAX_VALUE); dist[src] = 0;
        for (int i = 0; i < V-1; i++)
            for (int[] e : edges)
                if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]]+e[2] < dist[e[1]])
                    dist[e[1]] = dist[e[0]] + e[2];
        return dist;
    }
}`,
        `void bellmanFord(int V, int edges[][3], int E, int src, int dist[]) {
    for (int i=0; i<V; i++) dist[i] = INT_MAX;
    dist[src] = 0;
    for (int i=0; i<V-1; i++)
        for (int j=0; j<E; j++)
            if (dist[edges[j][0]]!=INT_MAX && dist[edges[j][0]]+edges[j][2]<dist[edges[j][1]])
                dist[edges[j][1]] = dist[edges[j][0]] + edges[j][2];
}`,
        `function bellmanFord(V, edges, src) {
    const dist = Array(V).fill(Infinity); dist[src] = 0;
    for (let i = 0; i < V-1; i++)
        for (const [u, v, w] of edges)
            if (dist[u] !== Infinity && dist[u]+w < dist[v]) dist[v] = dist[u]+w;
    return dist;
}`) },
    { name: "Catalan Number", vizType: "dp-table", description: "Count structurally unique BSTs", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("Catalan Number",
        `public class Catalan {
    public static int catalan(int n) {
        int[] dp = new int[n+1]; dp[0] = dp[1] = 1;
        for (int i=2; i<=n; i++)
            for (int j=0; j<i; j++) dp[i] += dp[j] * dp[i-1-j];
        return dp[n];
    }
}`,
        `int catalan(int n) {
    int dp[n+1]; dp[0]=dp[1]=1;
    for (int i=2; i<=n; i++) { dp[i]=0; for (int j=0; j<i; j++) dp[i]+=dp[j]*dp[i-1-j]; }
    return dp[n];
}`,
        `function catalan(n) {
    const dp = Array(n+1).fill(0); dp[0]=dp[1]=1;
    for (let i=2; i<=n; i++) for (let j=0; j<i; j++) dp[i]+=dp[j]*dp[i-1-j];
    return dp[n];
}`) },
    { name: "Fibonacci Sequence", vizType: "dp-table", description: "Compute nth Fibonacci using DP", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Fibonacci",
        `public class Fibonacci {
    public static int fib(int n) {
        int[] dp = new int[n+1]; dp[0]=0; dp[1]=1;
        for (int i=2; i<=n; i++) dp[i] = dp[i-1] + dp[i-2];
        return dp[n];
    }
}`,
        `int fibonacci(int n) {
    int dp[n+1]; dp[0]=0; dp[1]=1;
    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];
    return dp[n];
}`,
        `function fibonacci(n) {
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`) },
    { name: "Floyd-Warshall's Shortest Path", vizType: "dp-table", description: "All-pairs shortest paths", complexity: { time: "O(V³)", space: "O(V²)" },
      code: c("Floyd-Warshall",
        `public class FloydWarshall {
    public static void solve(int[][] dist, int V) {
        for (int k=0; k<V; k++)
            for (int i=0; i<V; i++)
                for (int j=0; j<V; j++)
                    if (dist[i][k]!=Integer.MAX_VALUE && dist[k][j]!=Integer.MAX_VALUE)
                        dist[i][j] = Math.min(dist[i][j], dist[i][k]+dist[k][j]);
    }
}`,
        `void floydWarshall(int dist[][V], int V) {
    for (int k=0; k<V; k++)
        for (int i=0; i<V; i++)
            for (int j=0; j<V; j++)
                if (dist[i][k]+dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k]+dist[k][j];
}`,
        `function floydWarshall(dist) {
    const V = dist.length;
    for (let k=0; k<V; k++)
        for (let i=0; i<V; i++)
            for (let j=0; j<V; j++)
                if (dist[i][k]+dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k]+dist[k][j];
    return dist;
}`) },
    { name: "Integer Partition", vizType: "dp-table", description: "Ways to partition an integer", complexity: { time: "O(n²)", space: "O(n²)" },
      code: c("Integer Partition",
        `public class IntPartition {
    public static int partition(int n) {
        int[] dp = new int[n+1]; dp[0] = 1;
        for (int i=1; i<=n; i++)
            for (int j=i; j<=n; j++) dp[j] += dp[j-i];
        return dp[n];
    }
}`,
        `int partition(int n) {
    int dp[n+1]; memset(dp,0,sizeof(dp)); dp[0]=1;
    for (int i=1; i<=n; i++) for (int j=i; j<=n; j++) dp[j]+=dp[j-i];
    return dp[n];
}`,
        `function partition(n) {
    const dp = Array(n+1).fill(0); dp[0]=1;
    for (let i=1; i<=n; i++) for (let j=i; j<=n; j++) dp[j]+=dp[j-i];
    return dp[n];
}`) },
    { name: "Knapsack Problem", vizType: "dp-table", description: "Maximize value within weight limit", complexity: { time: "O(nW)", space: "O(nW)" },
      code: c("0/1 Knapsack",
        `public class Knapsack {
    public static int solve(int[] wt, int[] val, int W) {
        int n = wt.length;
        int[][] dp = new int[n+1][W+1];
        for (int i=1; i<=n; i++)
            for (int w=1; w<=W; w++)
                dp[i][w] = wt[i-1]<=w ? Math.max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w]) : dp[i-1][w];
        return dp[n][W];
    }
}`,
        `int knapsack(int wt[], int val[], int W, int n) {
    int dp[n+1][W+1];
    for (int i=0; i<=n; i++)
        for (int w=0; w<=W; w++) {
            if (i==0||w==0) dp[i][w]=0;
            else if (wt[i-1]<=w) dp[i][w] = val[i-1]+dp[i-1][w-wt[i-1]]>dp[i-1][w] ? val[i-1]+dp[i-1][w-wt[i-1]] : dp[i-1][w];
            else dp[i][w]=dp[i-1][w];
        }
    return dp[n][W];
}`,
        `function knapsack(weights, values, capacity) {
    const n = weights.length;
    const dp = Array.from({length:n+1}, ()=>Array(capacity+1).fill(0));
    for (let i=1; i<=n; i++)
        for (let w=1; w<=capacity; w++)
            dp[i][w] = weights[i-1]<=w ? Math.max(values[i-1]+dp[i-1][w-weights[i-1]], dp[i-1][w]) : dp[i-1][w];
    return dp[n][capacity];
}`) },
    { name: "Knuth-Morris-Pratt's String Search", vizType: "text", description: "Efficient string matching with failure function", complexity: { time: "O(n+m)", space: "O(m)" },
      code: c("KMP",
        `public class KMP {
    static int[] buildLPS(String pat) {
        int[] lps = new int[pat.length()]; int len=0, i=1;
        while (i < pat.length()) {
            if (pat.charAt(i)==pat.charAt(len)) lps[i++]=++len;
            else if (len!=0) len=lps[len-1];
            else lps[i++]=0;
        }
        return lps;
    }
    public static void search(String txt, String pat) {
        int[] lps = buildLPS(pat);
        int i=0, j=0;
        while (i < txt.length()) {
            if (txt.charAt(i)==pat.charAt(j)) { i++; j++; }
            if (j==pat.length()) { System.out.println("Match at "+(i-j)); j=lps[j-1]; }
            else if (i<txt.length() && txt.charAt(i)!=pat.charAt(j)) { if (j!=0) j=lps[j-1]; else i++; }
        }
    }
}`,
        `void buildLPS(char* pat, int m, int lps[]) {
    int len=0; lps[0]=0; int i=1;
    while (i<m) { if (pat[i]==pat[len]) lps[i++]=++len; else if (len) len=lps[len-1]; else lps[i++]=0; }
}
void kmp(char* txt, char* pat) {
    int n=strlen(txt), m=strlen(pat), lps[m];
    buildLPS(pat, m, lps);
    int i=0, j=0;
    while (i<n) {
        if (txt[i]==pat[j]) { i++; j++; }
        if (j==m) { printf("Match at %d\\n", i-j); j=lps[j-1]; }
        else if (i<n && txt[i]!=pat[j]) { if (j) j=lps[j-1]; else i++; }
    }
}`,
        `function kmpSearch(text, pattern) {
    const lps = Array(pattern.length).fill(0);
    let len=0, i=1;
    while (i < pattern.length) {
        if (pattern[i]===pattern[len]) lps[i++]=++len;
        else if (len) len=lps[len-1]; else lps[i++]=0;
    }
    const matches = []; i=0; let j=0;
    while (i < text.length) {
        if (text[i]===pattern[j]) { i++; j++; }
        if (j===pattern.length) { matches.push(i-j); j=lps[j-1]; }
        else if (i<text.length && text[i]!==pattern[j]) { if (j) j=lps[j-1]; else i++; }
    }
    return matches;
}`) },
    { name: "Levenshtein's Edit Distance", vizType: "dp-table", description: "Minimum edits to transform strings", complexity: { time: "O(mn)", space: "O(mn)" },
      code: c("Edit Distance",
        `public class EditDistance {
    public static int solve(String a, String b) {
        int m=a.length(), n=b.length();
        int[][] dp = new int[m+1][n+1];
        for (int i=0; i<=m; i++) dp[i][0]=i;
        for (int j=0; j<=n; j++) dp[0][j]=j;
        for (int i=1; i<=m; i++)
            for (int j=1; j<=n; j++) {
                int cost = a.charAt(i-1)==b.charAt(j-1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i-1][j]+1, dp[i][j-1]+1), dp[i-1][j-1]+cost);
            }
        return dp[m][n];
    }
}`,
        `int editDistance(char* a, char* b) {
    int m=strlen(a), n=strlen(b), dp[m+1][n+1];
    for (int i=0; i<=m; i++) dp[i][0]=i;
    for (int j=0; j<=n; j++) dp[0][j]=j;
    for (int i=1; i<=m; i++)
        for (int j=1; j<=n; j++) {
            int cost = a[i-1]==b[j-1] ? 0 : 1;
            dp[i][j] = dp[i-1][j]+1<dp[i][j-1]+1 ? dp[i-1][j]+1 : dp[i][j-1]+1;
            if (dp[i-1][j-1]+cost < dp[i][j]) dp[i][j]=dp[i-1][j-1]+cost;
        }
    return dp[m][n];
}`,
        `function editDistance(a, b) {
    const m=a.length, n=b.length;
    const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
    for (let i=0; i<=m; i++) dp[i][0]=i;
    for (let j=0; j<=n; j++) dp[0][j]=j;
    for (let i=1; i<=m; i++)
        for (let j=1; j<=n; j++) {
            const cost = a[i-1]===b[j-1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
        }
    return dp[m][n];
}`) },
    { name: "Longest Common Subsequence", vizType: "dp-table", description: "Find longest subsequence common to both strings", complexity: { time: "O(mn)", space: "O(mn)" },
      code: c("LCS",
        `public class LCS {
    public static int lcs(String a, String b) {
        int m=a.length(), n=b.length();
        int[][] dp = new int[m+1][n+1];
        for (int i=1; i<=m; i++)
            for (int j=1; j<=n; j++)
                dp[i][j] = a.charAt(i-1)==b.charAt(j-1) ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
        return dp[m][n];
    }
}`,
        `int lcs(char* a, char* b) {
    int m=strlen(a), n=strlen(b), dp[m+1][n+1];
    memset(dp, 0, sizeof(dp));
    for (int i=1; i<=m; i++)
        for (int j=1; j<=n; j++)
            dp[i][j] = a[i-1]==b[j-1] ? dp[i-1][j-1]+1 : (dp[i-1][j]>dp[i][j-1] ? dp[i-1][j] : dp[i][j-1]);
    return dp[m][n];
}`,
        `function lcs(a, b) {
    const m=a.length, n=b.length;
    const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
    for (let i=1; i<=m; i++)
        for (let j=1; j<=n; j++)
            dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`) },
    { name: "Longest Increasing Subsequence", vizType: "bars", description: "Find longest increasing subsequence", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("LIS",
        `public class LIS {
    public static int lis(int[] arr) {
        int[] dp = new int[arr.length]; Arrays.fill(dp, 1);
        for (int i=1; i<arr.length; i++)
            for (int j=0; j<i; j++)
                if (arr[j]<arr[i]) dp[i] = Math.max(dp[i], dp[j]+1);
        return Arrays.stream(dp).max().getAsInt();
    }
}`,
        `int lis(int arr[], int n) {
    int dp[n]; for (int i=0; i<n; i++) dp[i]=1;
    for (int i=1; i<n; i++) for (int j=0; j<i; j++) if (arr[j]<arr[i] && dp[j]+1>dp[i]) dp[i]=dp[j]+1;
    int max=dp[0]; for (int i=1; i<n; i++) if (dp[i]>max) max=dp[i]; return max;
}`,
        `function lis(arr) {
    const dp = Array(arr.length).fill(1);
    for (let i=1; i<arr.length; i++)
        for (let j=0; j<i; j++) if (arr[j]<arr[i]) dp[i] = Math.max(dp[i], dp[j]+1);
    return Math.max(...dp);
}`) },
    { name: "Longest Palindromic Subsequence", vizType: "dp-table", description: "Find longest palindromic subsequence", complexity: { time: "O(n²)", space: "O(n²)" },
      code: c("Longest Palindromic Subsequence",
        `public class LPS {
    public static int lps(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i=0; i<n; i++) dp[i][i]=1;
        for (int len=2; len<=n; len++)
            for (int i=0; i<=n-len; i++) {
                int j = i+len-1;
                dp[i][j] = s.charAt(i)==s.charAt(j) ? dp[i+1][j-1]+2 : Math.max(dp[i+1][j], dp[i][j-1]);
            }
        return dp[0][n-1];
    }
}`,
        `int lps(char* s) {
    int n=strlen(s), dp[n][n]; memset(dp,0,sizeof(dp));
    for (int i=0; i<n; i++) dp[i][i]=1;
    for (int len=2; len<=n; len++)
        for (int i=0; i<=n-len; i++) { int j=i+len-1; dp[i][j]=s[i]==s[j]?dp[i+1][j-1]+2:(dp[i+1][j]>dp[i][j-1]?dp[i+1][j]:dp[i][j-1]); }
    return dp[0][n-1];
}`,
        `function lps(s) {
    const n=s.length, dp=Array.from({length:n},()=>Array(n).fill(0));
    for (let i=0; i<n; i++) dp[i][i]=1;
    for (let len=2; len<=n; len++)
        for (let i=0; i<=n-len; i++) { const j=i+len-1; dp[i][j]=s[i]===s[j]?dp[i+1][j-1]+2:Math.max(dp[i+1][j],dp[i][j-1]); }
    return dp[0][n-1];
}`) },
    { name: "Maximum Subarray", vizType: "bars", description: "Find contiguous subarray with largest sum (Kadane's)", complexity: { time: "O(n)", space: "O(1)" },
      code: c("Kadane's Algorithm",
        `public class MaxSubarray {
    public static int maxSubArray(int[] nums) {
        int maxSum = nums[0], curSum = nums[0];
        for (int i=1; i<nums.length; i++) {
            curSum = Math.max(nums[i], curSum + nums[i]);
            maxSum = Math.max(maxSum, curSum);
        }
        return maxSum;
    }
}`,
        `int maxSubArray(int nums[], int n) {
    int maxSum=nums[0], curSum=nums[0];
    for (int i=1; i<n; i++) { curSum = nums[i]>curSum+nums[i] ? nums[i] : curSum+nums[i]; if (curSum>maxSum) maxSum=curSum; }
    return maxSum;
}`,
        `function maxSubArray(nums) {
    let maxSum = nums[0], curSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        curSum = Math.max(nums[i], curSum + nums[i]);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
}`) },
    { name: "Maximum Sum Path", vizType: "dp-table", description: "Find path with maximum sum in a triangle", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("Maximum Sum Path",
        `public class MaxSumPath {
    public static int solve(int[][] triangle) {
        int n = triangle.length;
        int[] dp = triangle[n-1].clone();
        for (int i=n-2; i>=0; i--)
            for (int j=0; j<=i; j++)
                dp[j] = triangle[i][j] + Math.max(dp[j], dp[j+1]);
        return dp[0];
    }
}`,
        `int maxSumPath(int tri[][MAX], int n) {
    int dp[MAX]; for (int j=0; j<n; j++) dp[j]=tri[n-1][j];
    for (int i=n-2; i>=0; i--)
        for (int j=0; j<=i; j++) dp[j]=tri[i][j]+(dp[j]>dp[j+1]?dp[j]:dp[j+1]);
    return dp[0];
}`,
        `function maxSumPath(triangle) {
    const dp = [...triangle[triangle.length-1]];
    for (let i = triangle.length-2; i >= 0; i--)
        for (let j = 0; j <= i; j++)
            dp[j] = triangle[i][j] + Math.max(dp[j], dp[j+1]);
    return dp[0];
}`) },
    { name: "Nth Factorial", vizType: "dp-table", description: "Compute n! using dynamic programming", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Nth Factorial (DP)",
        `public class Factorial {
    public static long factorial(int n) {
        long[] dp = new long[n+1]; dp[0]=1;
        for (int i=1; i<=n; i++) dp[i] = dp[i-1] * i;
        return dp[n];
    }
}`,
        `long long factorial(int n) {
    long long dp[n+1]; dp[0]=1;
    for (int i=1; i<=n; i++) dp[i]=dp[i-1]*i;
    return dp[n];
}`,
        `function factorial(n) {
    const dp = [1];
    for (let i = 1; i <= n; i++) dp[i] = dp[i-1] * i;
    return dp[n];
}`) },
    { name: "Pascal's Triangle", vizType: "dp-table", description: "Generate Pascal's triangle", complexity: { time: "O(n²)", space: "O(n²)" },
      code: c("Pascal's Triangle",
        `public class Pascal {
    public static int[][] generate(int n) {
        int[][] tri = new int[n][];
        for (int i=0; i<n; i++) {
            tri[i] = new int[i+1]; tri[i][0]=tri[i][i]=1;
            for (int j=1; j<i; j++) tri[i][j]=tri[i-1][j-1]+tri[i-1][j];
        }
        return tri;
    }
}`,
        `void pascal(int n) {
    int tri[n][n]; memset(tri,0,sizeof(tri));
    for (int i=0; i<n; i++) { tri[i][0]=tri[i][i]=1; for (int j=1; j<i; j++) tri[i][j]=tri[i-1][j-1]+tri[i-1][j]; }
}`,
        `function pascal(n) {
    const tri = [];
    for (let i=0; i<n; i++) {
        tri[i] = Array(i+1).fill(0); tri[i][0]=tri[i][i]=1;
        for (let j=1; j<i; j++) tri[i][j]=tri[i-1][j-1]+tri[i-1][j];
    }
    return tri;
}`) },
    { name: "Shortest Common Supersequence", vizType: "dp-table", description: "Shortest string containing both subsequences", complexity: { time: "O(mn)", space: "O(mn)" },
      code: c("Shortest Common Supersequence",
        `public class SCS {
    public static int scs(String a, String b) {
        int m=a.length(), n=b.length();
        int[][] dp = new int[m+1][n+1];
        for (int i=0; i<=m; i++) dp[i][0]=i;
        for (int j=0; j<=n; j++) dp[0][j]=j;
        for (int i=1; i<=m; i++)
            for (int j=1; j<=n; j++)
                dp[i][j] = a.charAt(i-1)==b.charAt(j-1) ? dp[i-1][j-1]+1 : Math.min(dp[i-1][j], dp[i][j-1])+1;
        return dp[m][n];
    }
}`,
        `int scs(char* a, char* b) {
    int m=strlen(a), n=strlen(b), dp[m+1][n+1];
    for (int i=0; i<=m; i++) dp[i][0]=i;
    for (int j=0; j<=n; j++) dp[0][j]=j;
    for (int i=1; i<=m; i++)
        for (int j=1; j<=n; j++)
            dp[i][j] = a[i-1]==b[j-1] ? dp[i-1][j-1]+1 : (dp[i-1][j]<dp[i][j-1] ? dp[i-1][j] : dp[i][j-1])+1;
    return dp[m][n];
}`,
        `function scs(a, b) {
    const m=a.length, n=b.length;
    const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
    for (let i=0; i<=m; i++) dp[i][0]=i;
    for (let j=0; j<=n; j++) dp[0][j]=j;
    for (let i=1; i<=m; i++)
        for (let j=1; j<=n; j++)
            dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.min(dp[i-1][j], dp[i][j-1])+1;
    return dp[m][n];
}`) },
    { name: "Sieve of Eratosthenes", vizType: "grid", description: "Find all primes up to n", complexity: { time: "O(n log log n)", space: "O(n)" },
      code: c("Sieve of Eratosthenes",
        `public class Sieve {
    public static boolean[] sieve(int n) {
        boolean[] isPrime = new boolean[n+1]; Arrays.fill(isPrime, true);
        isPrime[0]=isPrime[1]=false;
        for (int p=2; p*p<=n; p++)
            if (isPrime[p]) for (int m=p*p; m<=n; m+=p) isPrime[m]=false;
        return isPrime;
    }
}`,
        `void sieve(int n) {
    bool isPrime[n+1]; memset(isPrime, true, sizeof(isPrime));
    isPrime[0]=isPrime[1]=false;
    for (int p=2; p*p<=n; p++)
        if (isPrime[p]) for (int m=p*p; m<=n; m+=p) isPrime[m]=false;
}`,
        `function sieve(n) {
    const isPrime = Array(n+1).fill(true);
    isPrime[0]=isPrime[1]=false;
    for (let p=2; p*p<=n; p++)
        if (isPrime[p]) for (let m=p*p; m<=n; m+=p) isPrime[m]=false;
    return isPrime.map((v,i) => v ? i : null).filter(Boolean);
}`) },
    { name: "Sliding Window", vizType: "bars", description: "Maintain a window of elements", complexity: { time: "O(n)", space: "O(k)" },
      code: c("Sliding Window Maximum",
        `public class SlidingWindow {
    public static int[] maxWindow(int[] arr, int k) {
        int[] result = new int[arr.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < arr.length; i++) {
            while (!dq.isEmpty() && dq.peek() < i-k+1) dq.poll();
            while (!dq.isEmpty() && arr[dq.peekLast()] < arr[i]) dq.pollLast();
            dq.offer(i);
            if (i >= k-1) result[i-k+1] = arr[dq.peek()];
        }
        return result;
    }
}`,
        `void slidingWindowMax(int arr[], int n, int k, int result[]) {
    int dq[n], front=0, rear=0;
    for (int i=0; i<n; i++) {
        while (front<rear && dq[front]<i-k+1) front++;
        while (front<rear && arr[dq[rear-1]]<arr[i]) rear--;
        dq[rear++] = i;
        if (i >= k-1) result[i-k+1] = arr[dq[front]];
    }
}`,
        `function slidingWindowMax(arr, k) {
    const result = [], dq = [];
    for (let i = 0; i < arr.length; i++) {
        while (dq.length && dq[0] < i-k+1) dq.shift();
        while (dq.length && arr[dq[dq.length-1]] < arr[i]) dq.pop();
        dq.push(i);
        if (i >= k-1) result.push(arr[dq[0]]);
    }
    return result;
}`) },
    { name: "Ugly Numbers", vizType: "dp-table", description: "Numbers with only 2,3,5 as prime factors", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Ugly Numbers",
        `public class UglyNumbers {
    public static int nthUgly(int n) {
        int[] ugly = new int[n]; ugly[0]=1;
        int i2=0, i3=0, i5=0;
        for (int i=1; i<n; i++) {
            ugly[i] = Math.min(ugly[i2]*2, Math.min(ugly[i3]*3, ugly[i5]*5));
            if (ugly[i]==ugly[i2]*2) i2++;
            if (ugly[i]==ugly[i3]*3) i3++;
            if (ugly[i]==ugly[i5]*5) i5++;
        }
        return ugly[n-1];
    }
}`,
        `int nthUgly(int n) {
    int ugly[n]; ugly[0]=1;
    int i2=0, i3=0, i5=0;
    for (int i=1; i<n; i++) {
        int next = ugly[i2]*2; if (ugly[i3]*3<next) next=ugly[i3]*3; if (ugly[i5]*5<next) next=ugly[i5]*5;
        ugly[i] = next;
        if (next==ugly[i2]*2) i2++;
        if (next==ugly[i3]*3) i3++;
        if (next==ugly[i5]*5) i5++;
    }
    return ugly[n-1];
}`,
        `function nthUgly(n) {
    const ugly = [1]; let i2=0, i3=0, i5=0;
    for (let i=1; i<n; i++) {
        ugly[i] = Math.min(ugly[i2]*2, ugly[i3]*3, ugly[i5]*5);
        if (ugly[i]===ugly[i2]*2) i2++;
        if (ugly[i]===ugly[i3]*3) i3++;
        if (ugly[i]===ugly[i5]*5) i5++;
    }
    return ugly[n-1];
}`) },
    { name: "Z String Search", vizType: "text", description: "String matching using Z-array", complexity: { time: "O(n+m)", space: "O(n+m)" },
      code: c("Z Algorithm",
        `public class ZSearch {
    static int[] buildZ(String s) {
        int n=s.length(); int[] z=new int[n]; int l=0, r=0;
        for (int i=1; i<n; i++) {
            if (i<r) z[i]=Math.min(r-i, z[i-l]);
            while (i+z[i]<n && s.charAt(z[i])==s.charAt(i+z[i])) z[i]++;
            if (i+z[i]>r) { l=i; r=i+z[i]; }
        }
        return z;
    }
    public static void search(String txt, String pat) {
        String s = pat + "$" + txt;
        int[] z = buildZ(s);
        for (int i=0; i<z.length; i++)
            if (z[i]==pat.length()) System.out.println("Match at " + (i-pat.length()-1));
    }
}`,
        `void zSearch(char* txt, char* pat) {
    int m=strlen(pat), n=strlen(txt);
    char s[m+n+2]; sprintf(s, "%s$%s", pat, txt);
    int len=strlen(s), z[len]; memset(z,0,sizeof(z));
    int l=0, r=0;
    for (int i=1; i<len; i++) {
        if (i<r) z[i] = (r-i<z[i-l]) ? r-i : z[i-l];
        while (i+z[i]<len && s[z[i]]==s[i+z[i]]) z[i]++;
        if (i+z[i]>r) { l=i; r=i+z[i]; }
        if (z[i]==m) printf("Match at %d\\n", i-m-1);
    }
}`,
        `function zSearch(text, pattern) {
    const s = pattern + "$" + text, n = s.length;
    const z = Array(n).fill(0); let l=0, r=0;
    for (let i=1; i<n; i++) {
        if (i<r) z[i] = Math.min(r-i, z[i-l]);
        while (i+z[i]<n && s[z[i]]===s[i+z[i]]) z[i]++;
        if (i+z[i]>r) { l=i; r=i+z[i]; }
    }
    return z.map((v,i) => v===pattern.length ? i-pattern.length-1 : -1).filter(v=>v>=0);
}`) },
  ],
  "Greedy": [
    { name: "Boyer–Moore's Majority Vote", vizType: "bars", description: "Find majority element in linear time", complexity: { time: "O(n)", space: "O(1)" },
      code: c("Boyer-Moore Majority Vote",
        `public class MajorityVote {
    public static int majorityElement(int[] nums) {
        int candidate=0, count=0;
        for (int n : nums) {
            if (count==0) candidate=n;
            count += (n==candidate) ? 1 : -1;
        }
        return candidate;
    }
}`,
        `int majorityElement(int nums[], int n) {
    int candidate=0, count=0;
    for (int i=0; i<n; i++) {
        if (count==0) candidate=nums[i];
        count += (nums[i]==candidate) ? 1 : -1;
    }
    return candidate;
}`,
        `function majorityElement(nums) {
    let candidate = 0, count = 0;
    for (const n of nums) {
        if (count === 0) candidate = n;
        count += n === candidate ? 1 : -1;
    }
    return candidate;
}`) },
    { name: "Dijkstra's Shortest Path", vizType: "graph", description: "Shortest paths from single source", complexity: { time: "O(V²)", space: "O(V)" },
      code: c("Dijkstra's Algorithm",
        `public class Dijkstra {
    public static int[] shortestPath(int[][] graph, int src) {
        int n=graph.length; int[] dist=new int[n]; boolean[] vis=new boolean[n];
        Arrays.fill(dist, Integer.MAX_VALUE); dist[src]=0;
        for (int i=0; i<n-1; i++) {
            int u=-1;
            for (int v=0; v<n; v++) if (!vis[v] && (u==-1||dist[v]<dist[u])) u=v;
            vis[u]=true;
            for (int v=0; v<n; v++)
                if (graph[u][v]!=0 && !vis[v] && dist[u]+graph[u][v]<dist[v])
                    dist[v]=dist[u]+graph[u][v];
        }
        return dist;
    }
}`,
        `void dijkstra(int graph[][V], int src, int dist[]) {
    bool vis[V]; memset(vis, false, sizeof(vis));
    for (int i=0; i<V; i++) dist[i]=INT_MAX;
    dist[src]=0;
    for (int c=0; c<V-1; c++) {
        int u=-1;
        for (int v=0; v<V; v++) if (!vis[v]&&(u==-1||dist[v]<dist[u])) u=v;
        vis[u]=1;
        for (int v=0; v<V; v++)
            if (graph[u][v] && !vis[v] && dist[u]+graph[u][v]<dist[v])
                dist[v]=dist[u]+graph[u][v];
    }
}`,
        `function dijkstra(graph, src) {
    const n=graph.length, dist=Array(n).fill(Infinity), vis=Array(n).fill(false);
    dist[src]=0;
    for (let i=0; i<n-1; i++) {
        let u=-1;
        for (let v=0; v<n; v++) if (!vis[v]&&(u===-1||dist[v]<dist[u])) u=v;
        vis[u]=true;
        for (let v=0; v<n; v++)
            if (graph[u][v] && dist[u]+graph[u][v]<dist[v]) dist[v]=dist[u]+graph[u][v];
    }
    return dist;
}`) },
    { name: "Job Scheduling Problem", vizType: "bars", description: "Schedule jobs to maximize profit", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("Job Scheduling",
        `public class JobScheduling {
    public static int schedule(int[][] jobs) {
        // jobs[i] = {deadline, profit}
        Arrays.sort(jobs, (a,b) -> b[1]-a[1]);
        int n = jobs.length, maxDeadline = 0;
        for (int[] j : jobs) maxDeadline = Math.max(maxDeadline, j[0]);
        int[] slot = new int[maxDeadline+1]; Arrays.fill(slot, -1);
        int profit = 0;
        for (int i = 0; i < n; i++)
            for (int j = jobs[i][0]; j >= 1; j--)
                if (slot[j] == -1) { slot[j] = i; profit += jobs[i][1]; break; }
        return profit;
    }
}`,
        `int schedule(int deadlines[], int profits[], int n) {
    // sort by profit descending (simplified)
    int maxD = 0, total = 0;
    for (int i=0; i<n; i++) if (deadlines[i]>maxD) maxD=deadlines[i];
    int slot[maxD+1]; memset(slot, -1, sizeof(slot));
    for (int i=0; i<n; i++)
        for (int j=deadlines[i]; j>=1; j--)
            if (slot[j]==-1) { slot[j]=i; total+=profits[i]; break; }
    return total;
}`,
        `function jobScheduling(jobs) {
    // jobs: [{deadline, profit}]
    jobs.sort((a,b) => b.profit - a.profit);
    const maxD = Math.max(...jobs.map(j=>j.deadline));
    const slot = Array(maxD+1).fill(-1);
    let profit = 0;
    for (const job of jobs)
        for (let j = job.deadline; j >= 1; j--)
            if (slot[j] === -1) { slot[j] = 1; profit += job.profit; break; }
    return profit;
}`) },
    { name: "Kruskal's Minimum Spanning Tree", vizType: "graph", description: "MST using edge sorting and union-find", complexity: { time: "O(E log E)", space: "O(V)" },
      code: c("Kruskal's MST",
        `public class Kruskal {
    static int find(int[] parent, int x) { return parent[x]==x ? x : (parent[x]=find(parent, parent[x])); }
    static void union(int[] parent, int[] rank, int x, int y) {
        int px=find(parent,x), py=find(parent,y);
        if (rank[px]<rank[py]) parent[px]=py;
        else if (rank[px]>rank[py]) parent[py]=px;
        else { parent[py]=px; rank[px]++; }
    }
    public static int mst(int V, int[][] edges) {
        Arrays.sort(edges, (a,b)->a[2]-b[2]);
        int[] parent=new int[V], rank=new int[V];
        for (int i=0; i<V; i++) parent[i]=i;
        int cost=0;
        for (int[] e : edges) {
            if (find(parent,e[0])!=find(parent,e[1])) { union(parent,rank,e[0],e[1]); cost+=e[2]; }
        }
        return cost;
    }
}`,
        `int parent[MAX], rnk[MAX];
int find(int x) { return parent[x]==x ? x : (parent[x]=find(parent[x])); }
void unite(int x, int y) { int px=find(x), py=find(y); if (rnk[px]<rnk[py]) parent[px]=py; else { parent[py]=px; if (rnk[px]==rnk[py]) rnk[px]++; } }
int kruskal(int edges[][3], int E, int V) {
    // sort edges by weight
    for (int i=0; i<V; i++) { parent[i]=i; rnk[i]=0; }
    int cost=0;
    for (int i=0; i<E; i++)
        if (find(edges[i][0])!=find(edges[i][1])) { unite(edges[i][0],edges[i][1]); cost+=edges[i][2]; }
    return cost;
}`,
        `function kruskal(V, edges) {
    edges.sort((a,b) => a[2]-b[2]);
    const parent = Array.from({length:V}, (_,i)=>i);
    function find(x) { return parent[x]===x ? x : (parent[x]=find(parent[x])); }
    let cost = 0;
    for (const [u,v,w] of edges)
        if (find(u) !== find(v)) { parent[find(u)] = find(v); cost += w; }
    return cost;
}`) },
    { name: "Prim's Minimum Spanning Tree", vizType: "graph", description: "MST by growing from a starting vertex", complexity: { time: "O(V²)", space: "O(V)" },
      code: c("Prim's MST",
        `public class Prim {
    public static int mst(int[][] graph) {
        int V=graph.length; boolean[] inMST=new boolean[V]; int[] key=new int[V];
        Arrays.fill(key, Integer.MAX_VALUE); key[0]=0; int cost=0;
        for (int i=0; i<V; i++) {
            int u=-1;
            for (int v=0; v<V; v++) if (!inMST[v]&&(u==-1||key[v]<key[u])) u=v;
            inMST[u]=true; cost+=key[u];
            for (int v=0; v<V; v++)
                if (graph[u][v]!=0 && !inMST[v] && graph[u][v]<key[v]) key[v]=graph[u][v];
        }
        return cost;
    }
}`,
        `int prim(int graph[][V]) {
    bool inMST[V]; int key[V];
    memset(inMST, false, sizeof(inMST));
    for (int i=0; i<V; i++) key[i]=INT_MAX;
    key[0]=0; int cost=0;
    for (int i=0; i<V; i++) {
        int u=-1;
        for (int v=0; v<V; v++) if (!inMST[v]&&(u==-1||key[v]<key[u])) u=v;
        inMST[u]=1; cost+=key[u];
        for (int v=0; v<V; v++)
            if (graph[u][v] && !inMST[v] && graph[u][v]<key[v]) key[v]=graph[u][v];
    }
    return cost;
}`,
        `function prim(graph) {
    const V=graph.length, inMST=Array(V).fill(false), key=Array(V).fill(Infinity);
    key[0]=0; let cost=0;
    for (let i=0; i<V; i++) {
        let u=-1;
        for (let v=0; v<V; v++) if (!inMST[v]&&(u===-1||key[v]<key[u])) u=v;
        inMST[u]=true; cost+=key[u];
        for (let v=0; v<V; v++)
            if (graph[u][v] && !inMST[v] && graph[u][v]<key[v]) key[v]=graph[u][v];
    }
    return cost;
}`) },
    { name: "Stable Matching", vizType: "graph", description: "Gale-Shapley stable matching algorithm", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("Gale-Shapley",
        `public class StableMatching {
    public static int[] match(int[][] menPref, int[][] womenPref) {
        int n = menPref.length;
        int[] wPartner = new int[n]; Arrays.fill(wPartner, -1);
        int[] mPartner = new int[n]; Arrays.fill(mPartner, -1);
        boolean[] freeM = new boolean[n]; Arrays.fill(freeM, true);
        int[] nextProposal = new int[n];
        while (true) {
            int m = -1;
            for (int i=0; i<n; i++) if (freeM[i]) { m=i; break; }
            if (m == -1) break;
            int w = menPref[m][nextProposal[m]++];
            if (wPartner[w] == -1) { wPartner[w]=m; mPartner[m]=w; freeM[m]=false; }
            else { /* compare preferences */ }
        }
        return mPartner;
    }
}`,
        `// Gale-Shapley stable matching
void stableMatch(int menPref[][MAX], int womenPref[][MAX], int n, int match[]) {
    int wPartner[MAX], nextProp[MAX];
    bool freeM[MAX];
    memset(wPartner, -1, sizeof(wPartner));
    memset(freeM, 1, sizeof(freeM));
    memset(nextProp, 0, sizeof(nextProp));
    // simplified: propose and accept/reject
}`,
        `function stableMatching(menPref, womenPref) {
    const n = menPref.length;
    const wPartner = Array(n).fill(-1), mPartner = Array(n).fill(-1);
    const freeM = Array(n).fill(true), nextProp = Array(n).fill(0);
    const wRank = womenPref.map(prefs => {
        const rank = {}; prefs.forEach((m,i) => rank[m]=i); return rank;
    });
    let free = freeM.indexOf(true);
    while (free !== -1) {
        const w = menPref[free][nextProp[free]++];
        if (wPartner[w] === -1) { wPartner[w]=free; mPartner[free]=w; freeM[free]=false; }
        else if (wRank[w][free] < wRank[w][wPartner[w]]) {
            freeM[wPartner[w]]=true; mPartner[wPartner[w]]=-1;
            wPartner[w]=free; mPartner[free]=w; freeM[free]=false;
        }
        free = freeM.indexOf(true);
    }
    return mPartner;
}`) },
  ],
  "Simple Recursive": [
    { name: "Cellular Automata", vizType: "grid", description: "Grid-based simulation with simple rules (Rule 110)", complexity: { time: "O(n×g)", space: "O(n)" },
      code: c("Cellular Automata (Rule 110)",
        `public class CellularAutomata {
    public static int[] step(int[] cells, int rule) {
        int[] next = new int[cells.length];
        for (int i=1; i<cells.length-1; i++) {
            int pattern = (cells[i-1]<<2)|(cells[i]<<1)|cells[i+1];
            next[i] = (rule >> pattern) & 1;
        }
        return next;
    }
}`,
        `void step(int cells[], int next[], int n, int rule) {
    for (int i=1; i<n-1; i++) {
        int pattern = (cells[i-1]<<2)|(cells[i]<<1)|cells[i+1];
        next[i] = (rule >> pattern) & 1;
    }
}`,
        `function cellularAutomata(cells, rule = 110) {
    return cells.map((_, i, arr) => {
        if (i === 0 || i === arr.length-1) return 0;
        const pattern = (arr[i-1]<<2)|(arr[i]<<1)|arr[i+1];
        return (rule >> pattern) & 1;
    });
}`) },
    { name: "Cycle Detection", vizType: "graph", description: "Detect cycles using Floyd's tortoise and hare", complexity: { time: "O(n)", space: "O(1)" },
      code: c("Floyd's Cycle Detection",
        `public class CycleDetection {
    public static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
        `bool hasCycle(Node* head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
        `function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}`) },
    { name: "Euclidean Greatest Common Divisor", vizType: "recursion-tree", description: "Find GCD using Euclidean algorithm", complexity: { time: "O(log min(a,b))", space: "O(log min(a,b))" },
      code: c("Euclidean GCD",
        `public class GCD {
    public static int gcd(int a, int b) {
        if (b == 0) return a;
        return gcd(b, a % b);
    }
}`,
        `int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}`,
        `function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}`) },
    { name: "Nth Factorial", vizType: "recursion-tree", description: "Compute n! recursively", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Recursive Factorial",
        `public class Factorial {
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,
        `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
        `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`) },
    { name: "Suffix Array", vizType: "text", description: "Array of sorted suffixes of a string", complexity: { time: "O(n log²n)", space: "O(n)" },
      code: c("Suffix Array",
        `public class SuffixArray {
    public static int[] build(String s) {
        int n = s.length();
        Integer[] sa = new Integer[n];
        for (int i=0; i<n; i++) sa[i]=i;
        Arrays.sort(sa, (a,b) -> s.substring(a).compareTo(s.substring(b)));
        return Arrays.stream(sa).mapToInt(Integer::intValue).toArray();
    }
}`,
        `void buildSuffixArray(char* s, int sa[], int n) {
    for (int i=0; i<n; i++) sa[i]=i;
    // simplified O(n^2 log n) sort
    for (int i=0; i<n-1; i++)
        for (int j=i+1; j<n; j++)
            if (strcmp(s+sa[i], s+sa[j]) > 0)
                { int t=sa[i]; sa[i]=sa[j]; sa[j]=t; }
}`,
        `function buildSuffixArray(s) {
    return Array.from({length: s.length}, (_, i) => i)
        .sort((a, b) => s.substring(a).localeCompare(s.substring(b)));
}`) },
  ],
  "Uncategorized": [
    { name: "Affine Cipher", vizType: "text", description: "Encryption using affine function E(x)=(ax+b) mod 26", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Affine Cipher",
        `public class AffineCipher {
    public static String encrypt(String text, int a, int b) {
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (Character.isLetter(c)) {
                int x = Character.toUpperCase(c) - 'A';
                sb.append((char)(((a * x + b) % 26) + 'A'));
            } else sb.append(c);
        }
        return sb.toString();
    }
}`,
        `void affineEncrypt(char* text, int a, int b, char* result) {
    for (int i=0; text[i]; i++) {
        if (text[i]>='A' && text[i]<='Z')
            result[i] = ((a*(text[i]-'A')+b) % 26) + 'A';
        else result[i] = text[i];
    }
}`,
        `function affineEncrypt(text, a = 5, b = 8) {
    return text.split('').map(ch => {
        if (/[A-Z]/.test(ch)) return String.fromCharCode(((a*(ch.charCodeAt(0)-65)+b)%26)+65);
        return ch;
    }).join('');
}`) },
    { name: "Caesar Cipher", vizType: "text", description: "Shift cipher encryption/decryption", complexity: { time: "O(n)", space: "O(n)" },
      code: c("Caesar Cipher",
        `public class CaesarCipher {
    public static String encrypt(String text, int shift) {
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (Character.isLetter(c)) {
                char base = Character.isUpperCase(c) ? 'A' : 'a';
                sb.append((char)((c - base + shift) % 26 + base));
            } else sb.append(c);
        }
        return sb.toString();
    }
}`,
        `void caesarEncrypt(char* text, int shift, char* result) {
    for (int i=0; text[i]; i++) {
        if (text[i]>='A' && text[i]<='Z')
            result[i] = ((text[i]-'A'+shift) % 26) + 'A';
        else result[i] = text[i];
    }
}`,
        `function caesarCipher(text, shift = 3) {
    return text.split('').map(ch => {
        if (/[A-Z]/i.test(ch)) {
            const base = ch === ch.toUpperCase() ? 65 : 97;
            return String.fromCharCode(((ch.charCodeAt(0)-base+shift)%26)+base);
        }
        return ch;
    }).join('');
}`) },
    { name: "Freivalds' Matrix-Multiplication Verification", vizType: "dp-table", description: "Probabilistic matrix multiplication check", complexity: { time: "O(n²)", space: "O(n)" },
      code: c("Freivalds' Algorithm",
        `public class Freivalds {
    public static boolean verify(int[][] A, int[][] B, int[][] C, int n) {
        int[] r = new int[n];
        Random rand = new Random();
        for (int i=0; i<n; i++) r[i] = rand.nextInt(2);
        // Compute B*r, then A*(B*r), then C*r
        int[] Br = new int[n], ABr = new int[n], Cr = new int[n];
        for (int i=0; i<n; i++)
            for (int j=0; j<n; j++) { Br[i]+=B[i][j]*r[j]; Cr[i]+=C[i][j]*r[j]; }
        for (int i=0; i<n; i++)
            for (int j=0; j<n; j++) ABr[i]+=A[i][j]*Br[j];
        return Arrays.equals(ABr, Cr);
    }
}`,
        `bool freivalds(int A[][N], int B[][N], int C[][N], int n) {
    int r[n], Br[n], ABr[n], Cr[n];
    memset(Br,0,sizeof(Br)); memset(ABr,0,sizeof(ABr)); memset(Cr,0,sizeof(Cr));
    for (int i=0; i<n; i++) r[i]=rand()%2;
    for (int i=0; i<n; i++) for (int j=0; j<n; j++) { Br[i]+=B[i][j]*r[j]; Cr[i]+=C[i][j]*r[j]; }
    for (int i=0; i<n; i++) for (int j=0; j<n; j++) ABr[i]+=A[i][j]*Br[j];
    for (int i=0; i<n; i++) if (ABr[i]!=Cr[i]) return false;
    return true;
}`,
        `function freivalds(A, B, C) {
    const n = A.length;
    const r = Array.from({length:n}, ()=>Math.round(Math.random()));
    const Br = A.map((_,i) => B[i].reduce((s,v,j) => s+v*r[j], 0));
    const ABr = A.map((row,i) => row.reduce((s,v,j) => s+v*Br[j], 0));
    const Cr = C.map((row,i) => row.reduce((s,v,j) => s+v*r[j], 0));
    return ABr.every((v,i) => v === Cr[i]);
}`) },
    { name: "K-Means Clustering", vizType: "points", description: "Partition points into K clusters", complexity: { time: "O(nki)", space: "O(nk)" },
      code: c("K-Means Clustering",
        `public class KMeans {
    public static int[] cluster(double[][] points, int k, int maxIter) {
        int n = points.length;
        double[][] centroids = new double[k][2];
        for (int i=0; i<k; i++) centroids[i] = points[i].clone();
        int[] labels = new int[n];
        for (int iter=0; iter<maxIter; iter++) {
            for (int i=0; i<n; i++) {
                double minD = Double.MAX_VALUE;
                for (int j=0; j<k; j++) {
                    double d = Math.hypot(points[i][0]-centroids[j][0], points[i][1]-centroids[j][1]);
                    if (d < minD) { minD=d; labels[i]=j; }
                }
            }
            // Update centroids
            for (int j=0; j<k; j++) {
                double sx=0, sy=0; int cnt=0;
                for (int i=0; i<n; i++)
                    if (labels[i]==j) { sx+=points[i][0]; sy+=points[i][1]; cnt++; }
                if (cnt>0) { centroids[j][0]=sx/cnt; centroids[j][1]=sy/cnt; }
            }
        }
        return labels;
    }
}`,
        `void kmeans(double points[][2], int n, int k, int labels[], int maxIter) {
    double centroids[k][2];
    for (int i=0; i<k; i++) { centroids[i][0]=points[i][0]; centroids[i][1]=points[i][1]; }
    for (int iter=0; iter<maxIter; iter++) {
        for (int i=0; i<n; i++) {
            double minD=1e18; labels[i]=0;
            for (int j=0; j<k; j++) {
                double d=hypot(points[i][0]-centroids[j][0], points[i][1]-centroids[j][1]);
                if (d<minD) { minD=d; labels[i]=j; }
            }
        }
        for (int j=0; j<k; j++) {
            double sx=0,sy=0; int cnt=0;
            for (int i=0; i<n; i++) if (labels[i]==j) { sx+=points[i][0]; sy+=points[i][1]; cnt++; }
            if (cnt) { centroids[j][0]=sx/cnt; centroids[j][1]=sy/cnt; }
        }
    }
}`,
        `function kmeans(points, k = 3, maxIter = 20) {
    let centroids = points.slice(0, k).map(p => ({...p}));
    const labels = Array(points.length).fill(0);
    for (let iter = 0; iter < maxIter; iter++) {
        for (let i = 0; i < points.length; i++) {
            let minD = Infinity;
            for (let j = 0; j < k; j++) {
                const d = Math.hypot(points[i].x-centroids[j].x, points[i].y-centroids[j].y);
                if (d < minD) { minD = d; labels[i] = j; }
            }
        }
        centroids = centroids.map((_, j) => {
            const cluster = points.filter((_, i) => labels[i] === j);
            if (!cluster.length) return centroids[j];
            return { x: cluster.reduce((s,p)=>s+p.x,0)/cluster.length, y: cluster.reduce((s,p)=>s+p.y,0)/cluster.length };
        });
    }
    return { labels, centroids };
}`) },
    { name: "Magic Square", vizType: "grid", description: "NxN grid with equal row/col/diagonal sums (Siamese method)", complexity: { time: "O(n²)", space: "O(n²)" },
      code: c("Magic Square (Siamese)",
        `public class MagicSquare {
    public static int[][] generate(int n) {
        int[][] sq = new int[n][n];
        int r=0, c=n/2;
        for (int num=1; num<=n*n; num++) {
            sq[r][c] = num;
            int nr=(r-1+n)%n, nc=(c+1)%n;
            if (sq[nr][nc]!=0) r=(r+1)%n;
            else { r=nr; c=nc; }
        }
        return sq;
    }
}`,
        `void magicSquare(int n, int sq[][MAX]) {
    memset(sq, 0, sizeof(int)*MAX*MAX);
    int r=0, c=n/2;
    for (int num=1; num<=n*n; num++) {
        sq[r][c] = num;
        int nr=(r-1+n)%n, nc=(c+1)%n;
        if (sq[nr][nc]) r=(r+1)%n;
        else { r=nr; c=nc; }
    }
}`,
        `function magicSquare(n) {
    const sq = Array.from({length:n}, ()=>Array(n).fill(0));
    let r = 0, c = Math.floor(n/2);
    for (let num = 1; num <= n*n; num++) {
        sq[r][c] = num;
        const nr = (r-1+n)%n, nc = (c+1)%n;
        if (sq[nr][nc]) r = (r+1)%n;
        else { r = nr; c = nc; }
    }
    return sq;
}`) },
    { name: "Maze Generation", vizType: "maze", description: "Generate random maze using recursive DFS", complexity: { time: "O(n²)", space: "O(n²)" },
      code: c("Maze Generation (DFS)",
        `public class MazeGen {
    static int[][] dirs = {{0,2},{2,0},{0,-2},{-2,0}};
    public static void generate(int[][] maze, int r, int c) {
        maze[r][c] = 0;
        List<int[]> d = Arrays.asList(dirs.clone());
        Collections.shuffle(d);
        for (int[] dir : d) {
            int nr=r+dir[0], nc=c+dir[1];
            if (nr>=0 && nr<maze.length && nc>=0 && nc<maze[0].length && maze[nr][nc]==1) {
                maze[r+dir[0]/2][c+dir[1]/2] = 0;
                generate(maze, nr, nc);
            }
        }
    }
}`,
        `int dx[]={0,2,0,-2}, dy[]={2,0,-2,0};
void generate(int maze[][SIZE], int r, int c) {
    maze[r][c] = 0;
    int order[] = {0,1,2,3};
    for (int i=3; i>0; i--) { int j=rand()%(i+1); int t=order[i]; order[i]=order[j]; order[j]=t; }
    for (int i=0; i<4; i++) {
        int nr=r+dx[order[i]], nc=c+dy[order[i]];
        if (nr>=0 && nr<SIZE && nc>=0 && nc<SIZE && maze[nr][nc]==1) {
            maze[r+dx[order[i]]/2][c+dy[order[i]]/2] = 0;
            generate(maze, nr, nc);
        }
    }
}`,
        `function generateMaze(size) {
    const maze = Array.from({length:size}, ()=>Array(size).fill(1));
    const dirs = [[0,2],[2,0],[0,-2],[-2,0]];
    function carve(r, c) {
        maze[r][c] = 0;
        const shuffled = [...dirs].sort(() => Math.random() - 0.5);
        for (const [dr,dc] of shuffled) {
            const nr=r+dr, nc=c+dc;
            if (nr>=0 && nr<size && nc>=0 && nc<size && maze[nr][nc]===1) {
                maze[r+dr/2][c+dc/2] = 0;
                carve(nr, nc);
            }
        }
    }
    carve(1, 1);
    return maze;
}`) },
    { name: "Miller-Rabin's Primality Test", vizType: "dp-table", description: "Probabilistic primality testing", complexity: { time: "O(k log²n)", space: "O(1)" },
      code: c("Miller-Rabin Primality",
        `public class MillerRabin {
    static long power(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        while (exp > 0) { if (exp%2==1) result=result*base%mod; exp>>=1; base=base*base%mod; }
        return result;
    }
    public static boolean isPrime(long n, int k) {
        if (n < 2) return false; if (n < 4) return true;
        long d = n-1; int r = 0;
        while (d%2==0) { d/=2; r++; }
        for (int i=0; i<k; i++) {
            long a = 2 + (long)(Math.random()*(n-3));
            long x = power(a, d, n);
            if (x==1||x==n-1) continue;
            boolean found = false;
            for (int j=0; j<r-1; j++) { x=x*x%n; if (x==n-1) { found=true; break; } }
            if (!found) return false;
        }
        return true;
    }
}`,
        `long long power(long long base, long long exp, long long mod) {
    long long result = 1; base %= mod;
    while (exp > 0) { if (exp&1) result=result*base%mod; exp>>=1; base=base*base%mod; }
    return result;
}
bool millerRabin(long long n, int k) {
    if (n<2) return false; if (n<4) return true;
    long long d=n-1; int r=0;
    while (d%2==0) { d/=2; r++; }
    for (int i=0; i<k; i++) {
        long long a=2+rand()%(n-3), x=power(a,d,n);
        if (x==1||x==n-1) continue;
        bool found=false;
        for (int j=0; j<r-1; j++) { x=x*x%n; if (x==n-1) { found=true; break; } }
        if (!found) return false;
    }
    return true;
}`,
        `function millerRabin(n, k = 10) {
    if (n < 2) return false; if (n < 4) return true;
    let d = n - 1, r = 0;
    while (d % 2 === 0) { d /= 2; r++; }
    function power(base, exp, mod) {
        let result = 1n; base = BigInt(base) % BigInt(mod);
        exp = BigInt(exp);
        while (exp > 0n) { if (exp%2n===1n) result=result*base%BigInt(mod); exp>>=1n; base=base*base%BigInt(mod); }
        return Number(result);
    }
    for (let i = 0; i < k; i++) {
        const a = 2 + Math.floor(Math.random() * (n - 3));
        let x = power(a, d, n);
        if (x === 1 || x === n-1) continue;
        let found = false;
        for (let j = 0; j < r-1; j++) { x = power(x, 2, n); if (x === n-1) { found=true; break; } }
        if (!found) return false;
    }
    return true;
}`) },
    { name: "Shortest Unsorted Continuous Subarray", vizType: "bars", description: "Find shortest subarray to sort", complexity: { time: "O(n)", space: "O(1)" },
      code: c("Shortest Unsorted Subarray",
        `public class ShortestUnsorted {
    public static int findLength(int[] nums) {
        int n = nums.length, start = -1, end = -1;
        int max = nums[0], min = nums[n-1];
        for (int i = 1; i < n; i++) {
            max = Math.max(max, nums[i]);
            if (nums[i] < max) end = i;
        }
        for (int i = n-2; i >= 0; i--) {
            min = Math.min(min, nums[i]);
            if (nums[i] > min) start = i;
        }
        return start == -1 ? 0 : end - start + 1;
    }
}`,
        `int findLength(int nums[], int n) {
    int start=-1, end=-1, mx=nums[0], mn=nums[n-1];
    for (int i=1; i<n; i++) { if (nums[i]>mx) mx=nums[i]; else if (nums[i]<mx) end=i; }
    for (int i=n-2; i>=0; i--) { if (nums[i]<mn) mn=nums[i]; else if (nums[i]>mn) start=i; }
    return start==-1 ? 0 : end-start+1;
}`,
        `function findUnsortedSubarray(nums) {
    let start = -1, end = -1, max = nums[0], min = nums[nums.length-1];
    for (let i = 1; i < nums.length; i++) {
        max = Math.max(max, nums[i]);
        if (nums[i] < max) end = i;
    }
    for (let i = nums.length-2; i >= 0; i--) {
        min = Math.min(min, nums[i]);
        if (nums[i] > min) start = i;
    }
    return start === -1 ? 0 : end - start + 1;
}`) },
  ],
};

