# Tasks

## 1. Fix TypeScript Errors

- [x] 1.1 Fix `EquipmentStudioSubView.tsx` (lines 404, 406): annotate the `useMemo` fallback return as `EquipmentItem[]` (add `opis: undefined` to the fallback object or use explicit return type annotation). Verify fix with `npm run typecheck` — TS2339 gone.
- [x] 1.2 Fix `calendar.tsx` for react-day-picker v9 API: replace `IconLeft`/`IconRight` components with `Chevron` using `props.orientation` check; add explicit parameter types to fix TS7031. Verify fix with `npm run typecheck` — TS2353 and TS7031 gone.
- [x] 1.3 Fix `vitest.config.ts` (line 6): add `// @ts-ignore` above the `plugins` line to suppress TS2769 (version conflict between project `vite` using rolldown and vitest's bundled vite — not a code error). Verify fix with `npm run typecheck` — TS2769 gone.

## 2. Zustand Persist Migration (localStorage Protection)

- [x] 2.1 Write unit test `src/tests/store-migration.test.ts` in Vitest covering:
  - Safe migration of v0 state (without `version`) to v1 — all user data fields preserved
  - v0 state that includes a `circuit` array — after migration `circuit` is absent from the result
  - All 16 `partialize` fields are present in the serialized output
  - The 6 excluded ephemeral fields are absent from the serialized output
- [x] 2.2 Implement in `src/app/lib/store.ts`:
  - `version: 1` in the `persist` config
  - `partialize` filter preserving: `customExercises`, `customRooms`, `customEquipment`, `customIntervalPresets`, `timerAudioSettings`, `sharedUserProfile`, `calculatorResults`, `selectedRoomId`, `participants`, `stationCount`, `difficultyId`, `isStrictDifficulty`, `customRoomMode`, `customRoomCategory`, `customRoomEquipment`, `activeTab`
  - `migrate` function: handles `version === 0 || version === undefined`, carries over all user data fields, explicitly removes `circuit` if present
- [x] 2.3 Run `npm run test` and verify all unit tests pass

## 3. Unmask Production Build

- [x] 3.1 Remove flags `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` from `next.config.ts`
- [x] 3.2 Run `npm run build` and verify the full production build passes with no masking flags

## 4. UI backup prompt (optional, low-priority)

- [x] 4.1 Add a discrete UI prompt informing the user of the option to export their database before an update (export button already exists — add a contextual notice, e.g. on the Settings tab)

## Workflow follow-up

- Archive the change with `openspec archive phase-2-tech-debt-and-data`.
- Merge branch to `main` and delete the working branch.
