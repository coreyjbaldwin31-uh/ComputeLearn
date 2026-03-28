---
name: "performance-pass"
description: "Perform a practical performance review of changed areas and likely hotspots. Use when: after a feature lands, when a route feels slow, or before a release where responsiveness matters. Keywords: performance, bottleneck, slow, optimize, render, query, bundle size, cache, latency, profiling, benchmark, memory, allocation, build time."
---

# Performance Pass

Review the changed area and likely hotspots for practical performance improvements. Find real bottlenecks, fix what is justified, and leave the codebase faster without breaking it.

## When to Use

- After a feature lands that adds complexity or data processing
- When a page, route, or operation feels slow
- Before a release where responsiveness matters
- When bundle size increased noticeably
- When build or test times degraded
- When `verify-full` or a reviewer flags a performance concern

## Required Context

1. **Read `PRD.md`** if it exists — understand performance-relevant requirements or constraints.
2. **Read `README.md`** if it exists — check for existing profiling or benchmark instructions.
3. **Read recently changed files** — the primary inspection target.
4. **Read `package.json`** — identify build output, bundle analysis tools, and scripts.
5. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Scope the Review

Identify what to inspect:

1. **Changed files** — `git diff --name-only HEAD~5` (or appropriate range)
2. **Hot path** — the user-facing operation or route that matters most
3. **Known slow areas** — anything flagged by reviewers, users, or prior profiling

Focus on the changed path first. Expand to adjacent code only if the changed path touches shared infrastructure.

### Step 2 — Rendering Performance (Frontend)

If the change touches React components:

| Check | What to Look For |
|-------|-----------------|
| **Unnecessary re-renders** | Components re-rendering when props haven't changed. Missing `memo`, `useMemo`, or `useCallback` where re-render cost is high. |
| **Expensive inline computations** | Filtering, sorting, or transforming large arrays inside render without memoization. |
| **Large component trees** | Single monolithic component that could split into smaller pieces with independent render cycles. |
| **Context over-broadcasting** | Context value changing on every render, causing all consumers to re-render. |
| **Key instability** | Using array index as key when list items reorder or change. |
| **Heavy initial load** | Large components or data fetched eagerly when they could be lazy-loaded. |

Do not add `memo` or `useMemo` everywhere — only where the component is expensive and re-renders frequently.

### Step 3 — Data and Query Performance

If the change involves data fetching or processing:

| Check | What to Look For |
|-------|-----------------|
| **Repeated queries** | Same data fetched multiple times in one render cycle or request. |
| **N+1 patterns** | Loop that makes a query per item instead of batching. |
| **Unbounded results** | Query that returns all records without pagination or limit. |
| **Missing indexes** | Database queries filtering on unindexed columns (if DB applies). |
| **Unnecessary data** | Fetching full objects when only a few fields are needed. |
| **No caching** | Identical expensive computation repeated across requests with same input. |

### Step 4 — Network and Bundle Performance

| Check | What to Look For |
|-------|-----------------|
| **Bundle size** | New dependency that significantly increases bundle. Check with `npm run build` output or bundle analyzer. |
| **Unused imports** | Importing an entire library when only one function is needed (tree-shaking failure). |
| **Redundant network calls** | Multiple API calls that could be combined. |
| **Missing compression** | Large responses without gzip/brotli. |
| **Static assets** | Unoptimized images, fonts loaded synchronously, missing caching headers. |
| **Code splitting** | Large pages that could use dynamic imports for below-fold content. |

### Step 5 — Build and Startup Performance

| Check | What to Look For |
|-------|-----------------|
| **Build time** | Did the change noticeably increase build time? |
| **Startup time** | Does the app take longer to start? Heavy top-level imports? |
| **Test time** | Did test suite time increase? Slow tests that could be faster? |
| **Docker build** | Inefficient layer ordering? Missing cache utilization? |

### Step 6 — Memory and Allocation

| Check | What to Look For |
|-------|-----------------|
| **Unbounded collections** | Arrays or maps that grow without limit (memory leak). |
| **Event listener cleanup** | Listeners added in useEffect without cleanup. |
| **Timer cleanup** | setInterval or setTimeout without clearInterval/clearTimeout. |
| **Large object retention** | Closures holding references to large objects longer than needed. |
| **String concatenation** | Building large strings in loops instead of using arrays and join. |

### Step 7 — Assess and Prioritize

For each finding, assess:

| Factor | Question |
|--------|----------|
| **Impact** | How much time/memory/bandwidth does this waste? |
| **Frequency** | How often does this code path execute? |
| **Fix complexity** | How risky or invasive is the fix? |
| **Evidence** | Is this a measured problem or a theoretical concern? |

Prioritize:

| Priority | Criteria |
|----------|----------|
| **Fix now** | High impact, frequent, low-risk fix, evidence-based |
| **Fix soon** | Medium impact, evidence-based, moderate fix complexity |
| **Note for later** | Low impact or theoretical, would require significant refactor |
| **Skip** | Theoretical concern with no evidence of real impact |

### Step 8 — Apply Targeted Optimizations

For each "fix now" item:

1. Make the change
2. Verify correctness is preserved (run relevant tests)
3. Measure improvement if practical (build time, bundle size, render count)
4. Document the tradeoff

Do not apply optimizations that sacrifice readability for marginal gains.

### Step 9 — Documentation

Update when relevant:

- **README.md** — when profiling commands, benchmark scripts, or performance-relevant run modes need documenting
- **`docs/performance.md`** — when findings have lasting value (known hotspots, architectural decisions, profiling methodology)

## Output Format

```
## Performance Outcome

### Scope
- Changed files reviewed: [count]
- Hot path: [description]
- Additional areas inspected: [list or "none"]

### Findings
| # | Category | Finding | Location | Impact | Priority |
|---|----------|---------|----------|--------|----------|
| 1 | render | ... | file:line | high/med/low | fix now / fix soon / later |
| ... | ... | ... | ... | ... | ... |

### Optimizations Applied
- [what was changed, where, and measured improvement — or "None"]

### Tradeoffs
- [any readability, complexity, or correctness tradeoffs made]

### Suggested Follow-Up
- [benchmarks to run, profiling to do, or deeper investigation needed — or "None"]

### Documentation Updated
- [files updated — or "no updates needed"]

### Performance Outcome
**[Improved — specific gains noted | Acceptable — no actionable bottlenecks found | Needs attention — significant issues identified but not yet fixed]**

Recommended next step: [implement fixes → implementer | profile deeper → developer | proceed to release → release-readiness]
```

## Rules

- Do not micro-optimize without evidence. The cost of the optimization must be justified by measured or clearly reasoned impact.
- Do not rewrite major subsystems for theoretical gains. Prefer small, targeted changes.
- Do not sacrifice correctness for speed. Verify behavior is preserved after every optimization.
- Do not add complexity (caching layers, memoization, lazy loading) unless the cost of not doing so is demonstrated.
- Explain tradeoffs clearly. Every optimization has a cost — state what it is.
- Prefer measurable improvements. "Bundle reduced by 15KB" over "should be faster."
- End with a section titled **"Performance Outcome"** containing the assessment, applied changes, and recommended next step.
