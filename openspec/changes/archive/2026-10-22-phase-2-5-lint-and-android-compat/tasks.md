# Tasks

## 1. Dead Code and Unused Imports Cleanup (Group A)

- [x] 1.1 Remove unused imports and unused variables in `ExerciseStudioView.tsx`, `IntervalTimerSubView.tsx`, `RoomStudioSubView.tsx`, `StationCard.tsx`, `TimerView.tsx`, `DifficultyLevelsSubView.tsx`, `EquipmentSelectionDialog.tsx`, `GenerationConflictDialog.tsx`, and `useTimerAudioTTS.ts`
- [x] 1.2 Add `displayName = 'StationCard'` in `StationCard.tsx` and rename unused variable to `_circuit` in `store.ts` migration function. Verify with `npx next lint` that Group A warnings are cleared

## 2. Offline Fonts Migration (Android-Ready)

- [x] 2.1 Replace external `<link href="fonts.googleapis.com">` in `src/app/layout.tsx` with self-hosted `next/font/google` (`Inter`). Verify with `npx next lint` that `@next/next/no-page-custom-font` is gone and fonts are bundled for offline Android usage

## 3. Timer and Audio Hooks Refactor (Group C)

- [x] 3.1 Refactor `GlobalIntervalTimerController.tsx`: stabilize `timerAudioSettings` via `useRef` and wrap `announceStep` in `useCallback` to satisfy `react-hooks/exhaustive-deps` without interval teardowns
- [x] 3.2 Refactor `GymViewModal.tsx`: wrap `announceStepStart` in `useCallback` and stabilize dependencies in `useEffect`
- [x] 3.3 Remove unnecessary `useMemo` dependencies in `EquipmentStudioSubView.tsx`, `ExerciseManualSelector.tsx`, `ExerciseStudioView.tsx`, `RoomStudioSubView.tsx`, and `StationCard.tsx`

## 4. UI Types Cleanup (Group B)

- [x] 4.1 Replace loose `any` casts with typed definitions in `GlobalIntervalTimerController.tsx`, `GymViewModal.tsx`, `ExerciseStudioView.tsx`, `src/hooks/use-toast.ts`, and `src/types/calculators.ts`

## 5. Verification and Mobile Export

- [x] 5.1 Run `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) and confirm 0 errors and 0 warnings
- [x] 5.2 Run `npm run build` and verify that the full static export (`out/`) completes cleanly for Android Studio synchronization

## Workflow follow-up

- Archive the change with `openspec archive phase-2-5-lint-and-android-compat`.
- Merge branch `chore/lint-cleanup-and-android-compat` into `main`.
