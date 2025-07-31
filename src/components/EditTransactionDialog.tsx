import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Stack, Alert
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, TransactionStatus, updateTransaction} from '../api/transactions';

type Props = {
    transaction: Transaction;
    onClose: () => void;
};

const statuses: TransactionStatus[] = ['PENDING', 'PAID', 'REJECTED'];

export const EditTransactionDialog: React.FC<Props> = ({ transaction, onClose }) => {
    const [form, setForm] = useState({
        name: transaction.name,
        value: transaction.value,
        date: new Date(transaction.date),
        status: transaction.status,
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (updated: Transaction) => updateTransaction(transaction.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            onClose();
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'value' ? Number(value) : value,
        }));
    };

    const isFormValid = form.name.trim() !== '' && form.value > 0;

    const handleSubmit = () => {
        mutation.mutate({
            ...transaction,
            name: form.name.trim(),
            value: form.value,
            date: form.date.toISOString(),
            status: form.status,
        });
    };

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Editar Transacción</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Nombre"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Valor"
                        name="value"
                        type="number"
                        value={form.value}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Fecha"
                            value={form.date}
                            onChange={(newDate) => {
                                if (newDate) {
                                    setForm((prev) => ({ ...prev, date: newDate }));
                                }
                            }}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                    <TextField
                        select
                        label="Estado"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        fullWidth
                    >
                        {statuses.map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
                {mutation.isError && (
                    <Alert severity="error">
                        Error al actualizar: {(mutation.error as Error).message}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid || mutation.isPending}>
                    Actualizar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
