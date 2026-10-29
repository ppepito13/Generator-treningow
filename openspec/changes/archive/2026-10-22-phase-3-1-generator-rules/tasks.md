# Tasks

## 1. Domain Types and Equipment Rules

- [x] 1.1 [src/domain/generator/types.ts] Create domain types and interfaces for generator parameters, filtering context, and zone requirements
- [x] 1.2 [src/domain/generator/equipmentRules.ts] Extract pure equipment verification functions (`ensureEquipment`, `getEquipmentString`, `canExerciseBeShared`)
- [x] 1.3 [src/tests/domain/equipmentRules.test.ts] Add unit tests for equipment verification functions and verify with `npx vitest run src/tests/domain/equipmentRules.test.ts`

## 2. Exercise Filtering and Zone Allocation

- [x] 2.1 [src/domain/generator/exerciseFilter.ts] Extract `getValidExercisesForZone` as a pure function with Dependency Injection (`allExercisesSource`) and single-flag rule (`hasFlagAlready`)
- [x] 2.2 [src/tests/domain/exerciseFilter.test.ts] Add unit tests for `getValidExercisesForZone` covering room restrictions, difficulty ranges, and pair modes with `npx vitest run src/tests/domain/exerciseFilter.test.ts`
- [x] 2.3 [src/domain/generator/zoneSelector.ts] Extract `selectRoomZonesForCircuit` covering RIG zone priority, forced zones, and flexible floor limits
- [x] 2.4 [src/tests/domain/zoneSelector.test.ts] Add unit tests for zone allocation and order sorting with `npx vitest run src/tests/domain/zoneSelector.test.ts`

## 3. Module Exports, Backward Compatibility and Verification

- [x] 3.1 [src/domain/generator/index.ts] Create barrel export file exposing all domain functions, constants, and types
- [x] 3.2 [src/app/lib/store.ts] Re-export domain generator functions from `@/domain/generator` in `store.ts` to guarantee backward compatibility
- [x] 3.3 Run `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) and confirm 0 errors and 0 warnings

## Workflow follow-up

- Archive the change with `openspec archive phase-3-1-generator-rules`.
- Merge branch `refactor/generator-domain-rules` into `main`.
