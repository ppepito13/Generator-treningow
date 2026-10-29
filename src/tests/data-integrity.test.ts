import { describe, it, expect } from 'vitest';
import exercises from '@/app/lib/data/lista_cwiczen.json';
import equipmentList from '@/app/lib/data/lista_sprzetu.json';
import roomsData from '@/app/lib/data/sala.json';
import levelsData from '@/app/lib/data/poziomy_trudnosci.json';
import segmentsData from '@/app/lib/data/segmenty.json';

describe('Baza Danych - Integralność i Spójność Relacyjna (Data Integrity)', () => {
  it('każde ćwiczenie posiada unikalne id_cwiczenia i niepustą nazwę', () => {
    const ids = new Set<string>();
    for (const ex of exercises) {
      expect(ex.id_cwiczenia).toBeDefined();
      expect(typeof ex.id_cwiczenia).toBe('string');
      expect(ex.id_cwiczenia.trim().length).toBeGreaterThan(0);
      expect(ids.has(ex.id_cwiczenia)).toBe(false);
      ids.add(ex.id_cwiczenia);

      expect(ex.nazwa).toBeDefined();
      expect(typeof ex.nazwa).toBe('string');
      expect(ex.nazwa.trim().length).toBeGreaterThan(0);
    }
  });

  it('każde ćwiczenie ma poprawny segment_id (zdefiniowany w segmenty.json) oraz poziom w zakresie zdefiniowanym w poziomy_trudnosci.json', () => {
    const validSegments = new Set(segmentsData.map(s => s.id));
    const minLevel = Math.min(...levelsData.map(l => l.min_poziom));
    const maxLevel = Math.max(...levelsData.map(l => l.max_poziom));

    for (const ex of exercises) {
      expect(
        validSegments.has(ex.segment_id),
        `Ćwiczenie "${ex.nazwa}" (${ex.id_cwiczenia}) ma nieznany segment_id: ${ex.segment_id}`
      ).toBe(true);

      expect(ex.poziom).toBeGreaterThanOrEqual(minLevel);
      expect(ex.poziom).toBeLessThanOrEqual(maxLevel);
      expect(['Solo', 'W_Parze']).toContain(ex.tryb_pracy);
    }
  });

  it('wszystkie wymagania sprzętowe ćwiczeń odnoszą się do istniejącego sprzętu w lista_sprzetu.json', () => {
    const availableEquipmentSet = new Set(equipmentList);

    for (const ex of exercises) {
      if (!ex.wymagania_sprzetowe) continue;

      for (const reqGroup of ex.wymagania_sprzetowe) {
        if (Array.isArray(reqGroup)) {
          // Wariant alternatywny (OR)
          for (const variant of reqGroup) {
            for (const eqKey of Object.keys(variant)) {
              expect(
                availableEquipmentSet.has(eqKey),
                `Ćwiczenie "${ex.nazwa}" (${ex.id_cwiczenia}) wymaga nieznanego sprzętu: "${eqKey}"`
              ).toBe(true);
            }
          }
        } else {
          // Pojedynczy wymóg (AND)
          for (const eqKey of Object.keys(reqGroup)) {
            expect(
              availableEquipmentSet.has(eqKey),
              `Ćwiczenie "${ex.nazwa}" (${ex.id_cwiczenia}) wymaga nieznanego sprzętu: "${eqKey}"`
            ).toBe(true);
          }
        }
      }
    }
  });

  it('wszystkie sale w sala.json mają unikalne ID i prawidłowy inwentarz', () => {
    const availableEquipmentSet = new Set(equipmentList);
    const roomIds = new Set<string>();

    for (const room of roomsData.sale) {
      expect(room.id_sali).toBeDefined();
      expect(roomIds.has(room.id_sali)).toBe(false);
      roomIds.add(room.id_sali);

      expect(room.maksymalna_pojemnosc.stacje).toBeGreaterThan(0);
      expect(room.maksymalna_pojemnosc.osoby).toBeGreaterThan(0);

      // Sprawdź inwentarz sali
      for (const eqKey of Object.keys(room.inwentarz)) {
        expect(
          availableEquipmentSet.has(eqKey),
          `Sala "${room.nazwa_sali}" zawiera w inwentarzu nieznany sprzęt: "${eqKey}"`
        ).toBe(true);
      }
    }
  });

  it('konfiguracja poziomów trudności zawiera poprawne definicje zakresów', () => {
    expect(levelsData.length).toBeGreaterThanOrEqual(4);
    for (const lvl of levelsData) {
      expect(lvl.min_poziom).toBeGreaterThanOrEqual(1);
      expect(lvl.max_poziom).toBeGreaterThanOrEqual(lvl.min_poziom);
    }
  });
});
