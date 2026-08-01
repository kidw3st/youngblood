import { describe, expect, it } from 'vitest';
import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatTime(33)).toBe('0:33');
    expect(formatTime(90)).toBe('1:30');
  });

  it('pads seconds under 10', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('prefixes negative values with a minus sign', () => {
    expect(formatTime(-81)).toBe('-1:21');
  });

  it('rounds fractional seconds', () => {
    expect(formatTime(33.6)).toBe('0:34');
  });
});
