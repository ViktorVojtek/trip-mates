import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchScore from './MatchScore';

describe('MatchScore', () => {
  it('returns null when userPrefs is null', () => {
    const { container } = render(<MatchScore userPrefs={null} tripPrefs="hiking" />);
    expect(container.children.length).toBe(0);
  });

  it('returns null when tripPrefs is null', () => {
    const { container } = render(<MatchScore userPrefs="hiking" tripPrefs={null} />);
    expect(container.children.length).toBe(0);
  });

  it('renders score label for high match (>=70)', () => {
    render(<MatchScore userPrefs="hiking,beaches,museums" tripPrefs="hiking,beaches,museums,culture" />);
    expect(screen.getByText('Great match')).toBeDefined();
  });

  it('renders score label for partial match (40-69)', () => {
    render(<MatchScore userPrefs="hiking,beaches,museums" tripPrefs="hiking,beaches,culture" />);
    expect(screen.getByText('Partial match')).toBeDefined();
  });

  it('renders score label for low match (<40)', () => {
    render(<MatchScore userPrefs="deep-sea-diving" tripPrefs="hiking" />);
    expect(screen.getByText('Low match')).toBeDefined();
  });

  it('displays percentage in score text', () => {
    render(<MatchScore userPrefs="hiking" tripPrefs="hiking" />);
    expect(screen.getByText(/100%/)).toBeDefined();
  });
});
