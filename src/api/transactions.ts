import axios from 'axios';

export type TransactionStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface Transaction {
    id: number;
    name: string;
    value: number;
    status: TransactionStatus;
    date: string;
}

export interface TransactionQueryParams {
    name?: string;
    status?: TransactionStatus;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
    sort?: string; // e.g., "date,desc"
}

// Base Axios instance
const api = axios.create({
    baseURL: "http://localhost:8085/api/transactions",
});

// GET list with filters/pagination/sorting
export const getTransactions = async (params: TransactionQueryParams) => {
    const response = await api.get('',{ params });
    console.log(response);
    return response.data;
};

// GET by ID
export const getTransactionById = async (id: number) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

// CREATE
export const createTransaction = async (transaction: Transaction) => {
    const response = await api.post('/', transaction);
    return response.data;
};

// UPDATE
export const updateTransaction = async (id: number, transaction: Transaction) => {
    const response = await api.put(`/${id}`, transaction);
    return response.data;
};

// DELETE
export const deleteTransaction = async (id: number) => {
    await api.delete(`/${id}`);
};

// PAY
export const payTransaction = async (id: number, payment: PaymentRequest) => {
    const response = await api.post(`/${id}/pay`, payment);
    return response.data;
};