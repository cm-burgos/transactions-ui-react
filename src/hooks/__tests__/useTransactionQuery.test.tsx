import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactionsQuery } from '../useTransactionsQuery';
import { getTransactions } from '../../api/transactions';

// Mock the API
jest.mock('../../api/transactions', () => ({
  getTransactions: jest.fn(),
}));

const mockGetTransactions = getTransactions as jest.MockedFunction<typeof getTransactions>;

describe('useTransactionsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockGetTransactions.mockClear();
  });

  it('fetches transactions with correct parameters', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'Test Transaction',
          value: 100,
          date: '2024-01-01T10:00:00Z',
          status: 'PENDING',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    };

    mockGetTransactions.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useTransactionsQuery({ page: 0, size: 10 }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetTransactions).toHaveBeenCalledWith({
      page: 0,
      size: 10,
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('handles error state', async () => {
    const error = new Error('API Error');
    mockGetTransactions.mockRejectedValue(error);

    const { result } = renderHook(
      () => useTransactionsQuery({ page: 0, size: 10 }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('shows loading state initially', () => {
    mockGetTransactions.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(
      () => useTransactionsQuery({ page: 0, size: 10 }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('refetches when parameters change', async () => {
    const mockResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    };

    mockGetTransactions.mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      ({ params }) => useTransactionsQuery(params),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
        initialProps: { params: { page: 0, size: 10 } },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Change parameters
    rerender({ params: { page: 1, size: 10 } });

    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith({
        page: 1,
        size: 10,
      });
    });
  });
});