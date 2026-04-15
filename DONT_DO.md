# Petra Portal: Codebase Constraints & "DONT_DO" Rules

To maintain high performance and production-quality code, the following rules MUST be followed by any AI agent or developer working on this project.

## 🚀 Performance & Rendering
- **DONT** put more than 300 lines of code in a single React component file. If a file grows too large, split it into modular components.
- **DONT** fetch data sequentially if multiple independent queries are needed. Always use `Promise.all` for parallel fetching.
- **DONT** leave images without `loading="lazy"`.
- **DONT** use unoptimized images. Always prefer WebP or compressed formats.
- **DO** use `useMemo` and `useCallback` for expensive calculations or callback props passed to heavy components.

## 💾 Database & API
- **DONT** perform database queries inside a loop (N+1 bottleneck). Always fetch in batches using `.in()` or `.select()`.
- **DONT** load more than 50 rows of data at once without implementing proper pagination.
- **DONT** fetch unnecessary columns. Always specify specific fields in `.select()`.
- **DO** implement caching for frequently accessed, slow-changing data (e.g., tutor directory).

## 🛠️ Architecture
- **DONT** put API keys or secrets in any client-side code.
- **DONT** use inline styles for anything beyond simple dynamic positioning. Move all styling to CSS modules or standardized `.css` files.
- **DO** follow the 3-column OS architecture (Sidebar | Workspace | Context) consistently.
- **DO** verify build stability with `npm run build` after major refactors.
