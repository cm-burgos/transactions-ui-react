import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilters } from '../TransactionFilters';
import { FilterState } from '../TransactionFilters';

describe('TransactionFilters', () => {
  const mockOnChange = jest.fn();
  const defaultFilters = {
    name: undefined,
    status: undefined,
    from: undefined,
    to: undefined,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all filter fields', () => {
    render(
      <TransactionFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    expect(screen.getByLabelText('Desde')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
  });

  it('calls onChange when name filter changes', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'test');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ name: 'test' });
    });
  });

  it('calls onChange when status filter changes', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const statusSelect = screen.getByLabelText('Estado');
    await user.click(statusSelect);
    await user.click(screen.getByText('Pendiente'));

    expect(mockOnChange).toHaveBeenCalledWith({ status: 'PENDING' });
  });

  it('calls onChange when date filters change', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const fromInput = screen.getByLabelText('Desde');
    await user.type(fromInput, '2024-01-01');

    expect(mockOnChange).toHaveBeenCalledWith({ from: '2024-01-01' });
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues: FilterState = {
      name: 'test',
      status: 'PENDING',
      from: '2024-01-01',
      to: '2024-01-31',
    };

    render(
      <TransactionFilters filters={filtersWithValues} onChange={mockOnChange} />
    );

    const clearButton = screen.getByText('Limpiar');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      name: undefined,
      status: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it('debounces name input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <TransactionFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'test');

    // Should not call onChange immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Wait for the debounce timeout
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ name: 'test' });
    }, { timeout: 6000 });
  });
});