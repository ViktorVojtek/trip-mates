import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripForm from './TripForm';

describe('TripForm', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all core form fields', () => {
    render(<TripForm onSubmit={onSubmit} />);
    expect(screen.getByPlaceholderText(/Summer Europe Family Adventure/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Paris, France/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Tell us about your trip/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Post Trip/i })).toBeDefined();
  });

  it('renders group type select with options', () => {
    render(<TripForm onSubmit={onSubmit} />);
    expect(screen.getByRole('option', { name: 'Families' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Couples' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Solo Travelers' })).toBeDefined();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /Post Trip/i }));
    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters/i)).toBeDefined();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Summer Europe Family Adventure/i), 'Italy Trip');
    await user.type(screen.getByPlaceholderText(/Paris, France/i), 'Rome, Italy');
    await user.type(
      screen.getByPlaceholderText(/Tell us about your trip/i),
      'A wonderful trip through the Italian countryside with great food and history.',
    );
    const dateInputs = screen.getAllByDisplayValue('');
    const startDate = dateInputs.find((el) => el.getAttribute('type') === 'date');
    const allDates = screen
      .getAllByRole('textbox', { hidden: true })
      .filter((el) => el.getAttribute('type') === 'date');
    void allDates;

    const inputs = document.querySelectorAll('input[type="date"]');
    await user.type(inputs[0] as HTMLElement, '2025-09-01');
    await user.type(inputs[1] as HTMLElement, '2025-09-10');
    void startDate;

    await user.selectOptions(screen.getByRole('combobox'), 'family');
    await user.click(screen.getByRole('button', { name: /Post Trip/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Italy Trip',
          destination: 'Rome, Italy',
          groupType: 'family',
        }),
        expect.anything(),
      );
    });
  });

  it('shows end-date error when end < start', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Summer Europe Family Adventure/i), 'Bad Dates');
    await user.type(screen.getByPlaceholderText(/Paris, France/i), 'Rome');
    await user.type(
      screen.getByPlaceholderText(/Tell us about your trip/i),
      'A longer description that meets the minimum requirement here.',
    );
    const inputs = document.querySelectorAll('input[type="date"]');
    await user.type(inputs[0] as HTMLElement, '2025-09-10');
    await user.type(inputs[1] as HTMLElement, '2025-09-01');
    await user.selectOptions(screen.getByRole('combobox'), 'family');
    await user.click(screen.getByRole('button', { name: /Post Trip/i }));

    await waitFor(() => {
      expect(screen.getByText(/End date must be on or after start date/i)).toBeDefined();
    });
  });

  it('pre-populates fields from defaultValues', () => {
    render(
      <TripForm
        onSubmit={onSubmit}
        defaultValues={{
          title: 'Pre-filled Title',
          destination: 'Tokyo',
          description: 'A great adventure in Japan.',
          startDate: '2025-10-01',
          endDate: '2025-10-15',
          groupType: 'friends',
          budget: 1500,
        }}
      />,
    );
    expect(screen.getByDisplayValue('Pre-filled Title')).toBeDefined();
    expect(screen.getByDisplayValue('Tokyo')).toBeDefined();
  });
});
