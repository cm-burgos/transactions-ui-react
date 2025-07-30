import { useQuery  } from '@tanstack/react-query';
import { getTransactions, TransactionQueryParams, } from '../api/transactions';

export const useTransactionsQuery = (params: TransactionQueryParams) => {
    return useQuery({
        initialData: undefined,
        queryKey: ['transactions', params],
        queryFn: () => getTransactions(params),
        staleTime: 1000 * 60 * 2,
    });
};
