import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionsTable } from '../TransactionsTable';
import { getTransactions, deleteTransaction } from '../../api/transactions';

// Mock the API
jest.mock('../../api/transactions', () => ({
  getTransactions: jest.fn(),
  deleteTransaction: jest.fn(),
}));

const mockGetTransactions = getTransactions as jest.MockedFunction<typeof getTransactions>;

const mockTransactions = [
  {
    id: 1,
    name: 'Test Transaction',
    value: 100,
    date: '2024-01-01T10:00:00Z',
    status: 'PENDING',
  },
  {
    id: 2,
    name: 'Another Transaction',
    value: 200,
    date: '2024-01-02T10:00:00Z',
    status: 'PAID',
  },
];

describe('TransactionsTable Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Setup default mock response
    mockGetTransactions.mockResolvedValue({
      content: mockTransactions,
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
    });
  });

  it('filters transactions when name filter changes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TransactionsTable />
      </QueryClientProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Transaction')).toBeInTheDocument();
      expect(screen.getByText('Another Transaction')).toBeInTheDocument();
    });

    // Mock filtered response
    mockGetTransactions.mockResolvedValueOnce({
      content: [mockTransactions[0]], // Only "Test Transaction"
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    });

    // Apply name filter
    const nameInput = screen.getByLabelText('Nombre');
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    // Verify that the filter was applied and results updated
    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
        })
      );
      expect(screen.getByText('Test Transaction')).toBeInTheDocument();
      expect(screen.queryByText('Another Transaction')).not.toBeInTheDocument();
    });
  });

  it('loads transactions on mount', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TransactionsTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 10,
          sort: 'date,desc',
        })
      );
      expect(screen.getByText('Test Transaction')).toBeInTheDocument();
      expect(screen.getByText('Another Transaction')).toBeInTheDocument();
    });
  });
});