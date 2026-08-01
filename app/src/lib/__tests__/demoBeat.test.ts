import { describe, expect, it } from 'vitest';
import { classifyStep } from '../demoBeat';

describe('classifyStep', () => {
  it('marks a kick every 4th step starting at 0', () => {
    expect(classifyStep(0).isKick).toBe(true);
    expect(classifyStep(4).isKick).toBe(true);
    expect(classifyStep(8).isKick).toBe(true);
    expect(classifyStep(12).isKick).toBe(true);
    expect(classifyStep(1).isKick).toBe(false);
    expect(classifyStep(2).isKick).toBe(false);
  });

  it('marks a hat on every odd step', () => {
    expect(classifyStep(1).isHat).toBe(true);
    expect(classifyStep(3).isHat).toBe(true);
    expect(classifyStep(0).isHat).toBe(false);
    expect(classifyStep(2).isHat).toBe(false);
  });
});
