import { describe, it, expect } from 'vitest';

describe('Sanity Check - Środowisko Vitest', () => {
  it('powinien poprawnie wykonać prosty test logiczny', () => {
    expect(1 + 1).toBe(2);
  });
});
