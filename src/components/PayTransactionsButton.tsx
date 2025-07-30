import React, { useState } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, Alert
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payTransactions } from '../api/transactions';

export const PayTransactionsButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [paymentValue, setPaymentValue] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: payTransactions,
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'transactions',
            });
            handleClose();
        },
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const handleSubmit = () => {
        if (typeof paymentValue !== 'number' || paymentValue <= 0) {
            setError('Ingrese un valor válido para el pago.');
            return;
        }

        mutation.mutate({ paymentValue });
    };

    const handleClose = () => {
        setOpen(false);
        setPaymentValue('');
        setError(null);
    };

    return (
        <>
            <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>
                Pagar Transacciones
            </Button>
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Pagar Transacciones Pendientes</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Valor del pago"
                            type="number"
                            fullWidth
                            value={paymentValue}
                            onChange={(e) => setPaymentValue(Number(e.target.value))}
                            required
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={mutation.isPending || paymentValue === ''}
                    >
                        Confirmar Pago
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
