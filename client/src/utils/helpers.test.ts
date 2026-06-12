import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatCurrency,
  calculateMatchScore,
  truncateText,
  getInitials,
  groupTypeLabel,
} from './helpers';

describe('formatDate', () => {
  it('formats a string date', () => {
    expect(formatDate('2025-06-15')).toBe('June 15, 2025');
  });

  it('formats a Date object', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('January 1, 2025');
  });
});

describe('formatCurrency', () => {
  it('formats with USD by default', () => {
    expect(formatCurrency(1234.50)).toBe('$1,234.50');
  });

  it('formats with a different currency', () => {
    expect(formatCurrency(0, 'EUR')).toBe('€0.00');
  });
});

describe('calculateMatchScore', () => {
  it('returns 33 for partial overlap', () => {
    expect(
      calculateMatchScore('hiking,beaches', 'hiking,museums'),
    ).toBe(33);
  });

  it('returns 100 for identical sets', () => {
    expect(calculateMatchScore('hiking', 'hiking')).toBe(100);
  });

  it('returns 0 for no overlap', () => {
    expect(calculateMatchScore('hiking', 'beaches')).toBe(0);
  });

  it('returns 0 when userPrefs is null', () => {
    expect(calculateMatchScore(null, 'hiking')).toBe(0);
  });

  it('returns 0 when tripPrefs is empty', () => {
    expect(calculateMatchScore('travel', '')).toBe(0);
  });
});

describe('truncateText', () => {
  it('truncates when text exceeds maxLength', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });

  it('returns text as-is when within maxLength', () => {
    expect(truncateText('hi', 5)).toBe('hi');
  });
});

describe('getInitials', () => {
  it('extracts initials from a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('extracts initials from a multi-word name', () => {
    expect(getInitials('Marie Curie')).toBe('MC');
  });
});

describe('groupTypeLabel', () => {
  it('returns label for "family"', () => {
    expect(groupTypeLabel('family')).toBe('Families');
  });

  it('returns label for "couples"', () => {
    expect(groupTypeLabel('couples')).toBe('Couples');
  });

  it('returns the type itself for unknown values', () => {
    expect(groupTypeLabel('invalid')).toBe('invalid');
  });
});
