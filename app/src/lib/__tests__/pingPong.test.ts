import { describe, expect, it } from 'vitest';
import { pingPongIndex } from '../pingPong';

describe('pingPongIndex', () => {
  it('counts forward from 0 to length-1', () => {
    expect(pingPongIndex(0, 4)).toBe(0);
    expect(pingPongIndex(1, 4)).toBe(1);
    expect(pingPongIndex(2, 4)).toBe(2);
    expect(pingPongIndex(3, 4)).toBe(3);
  });

  it('counts backward from length-1 to 0', () => {
    expect(pingPongIndex(4, 4)).toBe(2);
    expect(pingPongIndex(5, 4)).toBe(1);
    expect(pingPongIndex(6, 4)).toBe(0);
  });

  it('repeats the cycle', () => {
    expect(pingPongIndex(7, 4)).toBe(1);
    expect(pingPongIndex(8, 4)).toBe(2);
  });

  it('returns 0 for a single-frame sequence', () => {
    expect(pingPongIndex(0, 1)).toBe(0);
    expect(pingPongIndex(5, 1)).toBe(0);
  });
});
