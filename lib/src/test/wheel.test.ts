import { describe, expect, it } from 'vitest';
import { createWheelNormalizer } from '../lib/utils/wheel';

describe('wheel normalization', () => {
  it('accumulates small trackpad deltas', () => {
    const normalizer = createWheelNormalizer();
    const event = new WheelEvent('wheel', { deltaY: 30 });

    expect(normalizer.consume(event)).toBe(0);
    expect(normalizer.consume(event)).toBe(0);
    expect(normalizer.consume(event)).toBe(1);
  });

  it('caps large wheel movement per event', () => {
    const normalizer = createWheelNormalizer();
    const event = new WheelEvent('wheel', { deltaY: 1000 });

    expect(normalizer.consume(event)).toBe(2);
  });
});
