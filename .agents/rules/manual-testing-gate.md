# Human-in-the-Loop Manual Testing Gate Rule

- **NO PREMATURE ARCHIVE**: After completing implementation tasks in `/opsx-apply` and passing `npm run verify`, NEVER automatically archive the change (`/opsx-archive`), commit to git, push to origin, or create a PR.
- **MANDATORY MANUAL TEST INSTRUCTIONS**: In the completion response of `/opsx-apply`, the agent MUST provide the user with clear, actionable manual verification instructions:
  - Copy-pasteable runnable shell commands (e.g., `npm run dev`, `npx serve out -p 9002`, `npx cap sync android`).
  - Direct target URL or local endpoint (e.g., `http://localhost:9002`).
  - Step-by-step checklist tailored to the change (Web/UI responsiveness down to 360px, Android/Capacitor navigation/notch/back button, or domain logic).
- **AWAIT EXPLICIT USER APPROVAL**: The agent MUST stop and wait for explicit confirmation from the user (e.g., "działa", "tested", "approved") before proceeding to change archival and PR generation.
- **FEEDBACK LOOP**: If the user reports UI or behavior issues during testing, implement fixes directly within the same open OpenSpec change before proceeding.

