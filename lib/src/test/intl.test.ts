import { describe, expect, it } from 'vitest';
import { formatToken, parseToken } from '../lib/utils/intl';

describe('intl formatting', () => {
  it('supports legacy locale aliases', () => {
    const value = formatToken([1985, 4, 21], 'en-gb', 'L');
    expect(value).toContain('21');
  });

  it('formats tokenized patterns', () => {
    const value = formatToken([2024, 0, 9], 'en-US', 'YYYY-MM-DD');
    expect(value).toBe('2024-01-09');
  });

  it('parses localized numeric L format', () => {
    const parsed = parseToken('21/05/1985', 'en-gb', 'L');
    expect(parsed).toEqual([1985, 4, 21]);
  });
});
