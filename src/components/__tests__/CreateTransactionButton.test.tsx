import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils/renderWithProviders';
import { CreateTransactionButton } from '../CreateTransactionButton';
import { createTransaction } from '../../api/transactions';

jest.mock('../../api/transactions', () => ({
    createTransaction: jest.fn(),
}));

const mockCreateTransaction = createTransaction as jest.MockedFunction<typeof createTransaction>;

describe('CreateTransactionButton', () => {
    it('opens the dialog when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CreateTransactionButton />);

        await user.click(screen.getByText(/crear transacción/i));
        expect(screen.getByText(/nueva transacción/i)).toBeInTheDocument();
    });

    it('submits the form with correct data', async () => {
        const user = userEvent.setup();
        mockCreateTransaction.mockResolvedValueOnce({
            id: 1,
            name: 'Test Tx',
            value: 100,
            status: 'PENDING',
            date: '2024-01-01T10:00:00Z',
        });

        renderWithProviders(<CreateTransactionButton />);
        await user.click(screen.getByText(/crear transacción/i));
        await user.type(screen.getByLabelText(/nombre/i), 'Test Tx');
        await user.type(screen.getByLabelText(/valor/i), '100');
        await user.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(mockCreateTransaction).toHaveBeenCalledWith({
                name: 'Test Tx',
                value: 100,
                status: 'PENDING',
                date: expect.any(String),
            });
        });
    });

    it('shows an error if the API call fails', async () => {
        const user = userEvent.setup();
        mockCreateTransaction.mockRejectedValueOnce(new Error('errors'));

        renderWithProviders(<CreateTransactionButton />);
        await user.click(screen.getByText(/crear transacción/i));
        await user.type(screen.getByLabelText(/nombre/i), 'Fail Tx');
        await user.type(screen.getByLabelText(/valor/i), '100');
        await user.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });
});
