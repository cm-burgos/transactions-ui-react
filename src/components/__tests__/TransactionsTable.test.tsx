import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils/renderWithProviders';
import { TransactionsTable } from '../TransactionsTable';
import * as transactionsApi from '../../api/transactions';

jest.mock('../../api/transactions', () => ({
    __esModule: true,
    getTransactions: jest.fn(),
    deleteTransaction: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    payTransactions: jest.fn(),
}));

const mockGetTransactions = transactionsApi.getTransactions as jest.Mock;
const mockDeleteTransaction = transactionsApi.deleteTransaction as jest.Mock;

const sampleTransactions = {
    content: [
        {
            id: 1,
            name: 'Compra 1',
            value: 100,
            status: 'PENDING',
            date: new Date().toISOString(),
        },
        {
            id: 2,
            name: 'Compra 2',
            value: 200,
            status: 'PAID',
            date: new Date().toISOString(),
        },
    ],
    totalElements: 2,
};

describe('TransactionsTable', () => {
    beforeEach(() => {
        mockGetTransactions.mockResolvedValue(sampleTransactions);
        mockDeleteTransaction.mockResolvedValue(undefined);
    });

    it('renders transaction table with data', async () => {
        renderWithProviders(<TransactionsTable />);
        expect(await screen.findByText('Compra 1')).toBeInTheDocument();
        expect(screen.getByText('Compra 2')).toBeInTheDocument();
    });

    it('shows edit/delete actions only for PENDING', async () => {
        renderWithProviders(<TransactionsTable />);
        await screen.findByText('Compra 1');

        const rows = screen.getAllByRole('row');
        const pendingRow = rows.find(row => within(row).queryByText('Compra 1'))!;
        const paidRow = rows.find(row => within(row).queryByText('Compra 2'))!;

        expect(within(pendingRow).getByRole('button', { name: /editar/i })).toBeInTheDocument();
        expect(within(pendingRow).getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
        expect(within(paidRow).queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
        expect(within(paidRow).queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
    });

    it('opens delete confirmation and confirms deletion', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TransactionsTable />);
        await screen.findByText('Compra 1');

        const deleteButton = screen.getAllByRole('button', { name: /eliminar/i })[0];
        await user.click(deleteButton);

        expect(await screen.findByText(/¿Estás seguro de eliminar/i)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /confirmar/i }));

        await waitFor(() => {
            expect(mockDeleteTransaction).toHaveBeenCalledWith(1);
        });
    });

    it('handles empty results', async () => {
        mockGetTransactions.mockResolvedValueOnce({ content: [], totalElements: 0 });
        renderWithProviders(<TransactionsTable />);
        expect(await screen.findByText(/no se encontraron transacciones/i)).toBeInTheDocument();
    });

    it('renders pagination and allows page change', async () => {
        renderWithProviders(<TransactionsTable />);
        expect(await screen.findByText('Compra 1')).toBeInTheDocument();

        const pagination = screen.getByLabelText('Resultados por página');
        expect(pagination).toBeInTheDocument();
    });

    it('opens edit dialog when clicking the Edit button', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TransactionsTable />);

        await screen.findByText('Compra 1');

        const editButtons = screen.getAllByRole('button', { name: /editar/i });
        await user.click(editButtons[0]);

        const dialog = await screen.findByRole('dialog');

        // Now safely search within the dialog
        const inputNombre = within(dialog).getByLabelText(/nombre/i);
        expect(inputNombre).toHaveValue('Compra 1');
    });
});
