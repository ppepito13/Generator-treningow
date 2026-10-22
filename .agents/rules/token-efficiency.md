# Token Efficiency & Atomic Tasks Rule

- All tasks planned via OpenSpec MUST be micro-tasks (atomic, self-contained).
- Every task description in `tasks.md` MUST explicitly cite the target file path: `- [ ] X.Y [path/to/file.ts] Description`.
- During `opsx-apply`, DO NOT scan the whole workspace. Only read the current task in `tasks.md` and the single target file.
- Mark `[x]` immediately after completing each task to allow seamless switching between AI models/accounts.
- Prefer multiple small OpenSpec changes (e.g., Phase 3.1, Phase 3.2) over large monolithic ones.
