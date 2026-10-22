# Design

## Context
The application currently compiles with error masking (`ignoreBuildErrors` in `next.config.ts`), and the code contains known TypeScript errors. Additionally, the application state stored in `localStorage` (under the key `kinetic-circuits-storage`) by the Zustand library has no defined `version` or `migrate` function, which risks application failure for users upon any data model change.

A full `tsc --noEmit` audit revealed **6 TypeScript errors** across 3 files:
- `EquipmentStudioSubView.tsx` (lines 404, 406) – 2× TS2339
- `calendar.tsx` (lines 57, 60) – TS2353 + 2× TS7031
- `vitest.config.ts` (line 6) – TS2769 (version conflict, not a code error)

## Goals / Non-Goals

**Goals:**
- Eliminate all errors reported by `tsc --noEmit`.
- Unlock strict production compilation in Next.js (`ignoreBuildErrors: false`).
- Protect user data in `localStorage` by adding version `1`, safe migration from v0 state, and a `partialize` filter.
- Verify migration with a Vitest unit test.

**Non-Goals:**
- Decomposing the `store.ts` monolith and extracting generators into separate modules (reserved for the next change: Phase 3).
- Changes to UI views and training logic.
- Adding a "clear calculator results" button (noted for a future phase).

## Decisions

### Decision 1: Fix EquipmentStudio TS2339 via explicit return type
The real root cause in `EquipmentStudioSubView.tsx` is the fallback path in `allEquipment` (lines ~56–60): `ALL_EQUIPMENT.map(key => ({ id, nazwa, isCustom }))` infers a narrower type without `opis`, creating a union with `EquipmentItem` that lacks `opis`. TypeScript then errors at lines 404/406 where `opis` is read.

Fix: annotate the fallback object with `opis: undefined`, or type the `useMemo` return as `EquipmentItem[]`.
*Alternative:* `as any` cast (rejected as inconsistent with engineering standards).

### Decision 2: Fix calendar.tsx for react-day-picker v9 API
Version 9 of `react-day-picker` changed the `components` interface. Instead of the deprecated `IconLeft` and `IconRight`, use the `Chevron` component with `props.orientation` check. Destructured parameters must also be explicitly typed.
*Alternative:* Downgrade library to v8 (rejected – we want to maintain current project dependencies).

### Decision 3: Fix vitest.config.ts TS2769 via type suppression
The error in `vitest.config.ts` is **not a code error** – it is a version conflict between `vite` (using `rolldown` internals) and `vitest` (bundled with an older `vite`). The `Plugin<any>[]` types from the two `vite` versions are structurally incompatible at the `hotUpdate` hook level.

Fix: add `// @ts-ignore` above the `plugins` line in `vitest.config.ts`.
*Alternative:* Upgrade `vitest` to a version that ships with the same `vite` version as the project's root `vite`. This is the correct long-term fix but risks breaking the test runner setup and is out of scope for this tech-debt change.

### Decision 4: Zustand Persist with version, migrate, and partialize

In `store.ts`, the `persist` middleware configuration will be extended with:

- **`version: 1`**

- **`partialize`** – only the following fields are written to `localStorage`:

  | Field | Reason |
  |:---|:---|
  | `customExercises` | User data – must persist |
  | `customRooms` | User data – must persist |
  | `customEquipment` | User data – must persist |
  | `customIntervalPresets` | User data – must persist |
  | `timerAudioSettings` | User preference – must persist |
  | `sharedUserProfile` | User data (calculators) – must persist |
  | `calculatorResults` | User results – must persist |
  | `selectedRoomId` | User preference – must persist |
  | `participants` | User preference – must persist |
  | `stationCount` | User preference – must persist |
  | `difficultyId` | User preference – must persist |
  | `isStrictDifficulty` | User preference – must persist |
  | `customRoomMode` | User preference – must persist |
  | `customRoomCategory` | User preference – must persist |
  | `customRoomEquipment` | User preference – must persist |
  | `activeTab` | UX preference – remembers last open tab (Variant A) |

  The following fields are **excluded** from `localStorage` (ephemeral / UI state):

  | Field | Reason |
  |:---|:---|
  | `activeView` | Navigation state – restored to default on reload |
  | `navigationStack` | Navigation state – restored to `['HOME']` on reload |
  | `circuit` | Runtime data – not persisted |
  | `isGenerated` | Runtime flag – not persisted |
  | `generationConflict` | Transient UI state – not persisted |
  | `activeIntervalExecution` | Runtime timer state – not persisted |

- **`migrate`** – handles state with `version === 0 || version === undefined`:
  - Carries over all user data fields (exercises, rooms, equipment, presets, profile, settings).
  - **Explicitly clears `circuit`** if present in the v0 snapshot (circuit data is ephemeral and must not survive migration).
  - Returns a clean v1-shaped object.

## Risks / Trade-offs

- **[Risk] User data corruption during migration** → **[Mitigation]** Write a dedicated Vitest unit test (`src/tests/store-migration.test.ts`) that loads a sample v0 state (including a `circuit` array) and verifies correct conversion to v1 format without data loss, and that `circuit` is absent from the migrated result.

- **[Risk] localStorage unavailable** (Safari Private Browsing, QuotaExceededError) → **[Mitigation]** Zustand's `createJSONStorage` wraps calls but does not catch all exceptions. If `localStorage` access throws, the application falls back to in-memory state without a visible crash. No additional wrapper is added in this phase; this is noted as a known limitation.

- **[Risk] Unmasking build errors reveals new TS errors introduced in store.ts** → **[Mitigation]** Run `tsc --noEmit` after every task, not just at the end. The final build verification (Task 2.2) is scheduled **after** the Zustand implementation (Task 3.3) to ensure all changes are compiled cleanly together.
