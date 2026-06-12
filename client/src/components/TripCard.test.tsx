import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TripCard from './TripCard';
import type { Trip } from '../types';

const makeTrip = (overrides?: Partial<Trip>): Trip => ({
  id: '1',
  title: 'Summer in Paris',
  description: 'A wonderful trip to the city of lights.',
  destination: 'Paris',
  startDate: '2025-07-01',
  endDate: '2025-07-14',
  groupType: 'family',
  activityPref: 'museums,food',
  budget: 2000,
  createdById: 'u1',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  ...overrides,
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/trips/1']}>
    <Routes>
      <Route path="/trips/:id" element={<div>Trip Detail</div>} />
    </Routes>
    {children}
  </MemoryRouter>
);

it('renders trip title and destination', () => {
  render(<Wrapper><TripCard trip={makeTrip()} /></Wrapper>);
  expect(screen.getByText('Summer in Paris')).toBeDefined();
  expect(screen.getByText('Paris')).toBeDefined();
});

it('renders budget when present', () => {
  render(<Wrapper><TripCard trip={makeTrip({ budget: 2000 })} /></Wrapper>);
  expect(screen.getByText('Budget: $2,000')).toBeDefined();
});

it('does not render budget when zero', () => {
  render(<Wrapper><TripCard trip={makeTrip({ budget: 0 })} /></Wrapper>);
  expect(screen.queryByText(/Budget:/)).toBeNull();
});

it('renders group type badge', () => {
  render(<Wrapper><TripCard trip={makeTrip({ groupType: 'couples' })} /></Wrapper>);
  expect(screen.getByText('Couples')).toBeDefined();
});

it('renders activity tags when activityPref is set', () => {
  render(<Wrapper><TripCard trip={makeTrip({ activityPref: 'hiking,beaches' })} /></Wrapper>);
  expect(screen.getByText('hiking')).toBeDefined();
  expect(screen.getByText('beaches')).toBeDefined();
});

it('links to trip detail page', () => {
  const { container } = render(<Wrapper><TripCard trip={makeTrip()} /></Wrapper>);
  const link = container.querySelector('a') as HTMLAnchorElement;
  expect(link?.href).toContain('/trips/1');
});

it('shows duration in days', () => {
  render(<Wrapper><TripCard trip={makeTrip({ startDate: '2025-07-01', endDate: '2025-07-14' })} /></Wrapper>);
  expect(screen.getByText('13d')).toBeDefined();
});
