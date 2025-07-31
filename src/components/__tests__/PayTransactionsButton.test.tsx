import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PayTransactionsButton } from '../PayTransactionsButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { payTransactions } from '../../api/transactions';

jest.mock('../../api/transactions', () => ({
    payTransactions: jest.fn(),
}));

const mockPayTransactions = payTransactions as jest.MockedFunction<typeof payTransactions>;

const renderWithClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );
};

describe('PayTransactionsButton', () => {
    it('opens dialog when button is clicked', async () => {
        const user = userEvent.setup();
        renderWithClient(<PayTransactionsButton />);
        await user.click(screen.getByText(/Pagar Transacciones/i));
        expect(screen.getByText(/Pagar Transacciones Pendientes/i)).toBeInTheDocument();
    });

    it('submits valid payment value', async () => {
        const user = userEvent.setup();
        mockPayTransactions.mockResolvedValueOnce(undefined);

        renderWithClient(<PayTransactionsButton />);
        await user.click(screen.getByText(/Pagar Transacciones/i));

        const input = screen.getByLabelText(/valor del pago/i);
        await user.clear(input);
        await user.type(input, '150');

        await user.click(screen.getByText(/Confirmar Pago/i));

        await waitFor(() =>
            expect(mockPayTransactions).toHaveBeenCalledWith({ paymentValue: 150 })
        );
    });

    it('shows error if API fails', async () => {
        const user = userEvent.setup();
        mockPayTransactions.mockRejectedValueOnce(new Error('Something went wrong'));

        renderWithClient(<PayTransactionsButton />);
        await user.click(screen.getByText(/Pagar Transacciones/i));

        const input = screen.getByLabelText(/valor del pago/i);
        await user.clear(input);
        await user.type(input, '150');
        await user.click(screen.getByText(/Confirmar Pago/i));

        await screen.findByText(/Something went wrong/i);
    });

    it('shows validation error for invalid input', async () => {
        const user = userEvent.setup();
        renderWithClient(<PayTransactionsButton />);
        await user.click(screen.getByText(/Pagar Transacciones/i));

        const input = screen.getByLabelText(/valor del pago/i);
        await user.clear(input);
        await user.type(input, '-50');

        await user.click(screen.getByText(/Confirmar Pago/i));

        expect(await screen.findByText(/Ingrese un valor válido/i)).toBeInTheDocument();
        expect(mockPayTransactions).not.toHaveBeenCalled();
    });
});
