import React, { useState } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Stack, Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { createTransaction, TransactionStatus } from '../api/transactions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {STATUS_TRANSLATIONS} from "./TransactionsTable";

const statuses: TransactionStatus[] = ['PENDING', 'PAID', 'REJECTED'];

export const CreateTransactionButton: React.FC = () => {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState<{
        name: string;
        value: string; // <-- now string
        date: Date;
        status: TransactionStatus;
    }>({
        name: '',
        value: '',
        date: new Date(),
        status: 'PENDING',
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setOpen(false);
            setForm({
                name: '',
                value: '',
                date: new Date(),
                status: 'PENDING',
            });
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const isFormValid =
        form.name.trim() !== '' &&
        form.value.trim() !== '' &&
        !isNaN(Number(form.value)) &&
        Number(form.value) > 0 &&
        form.date instanceof Date &&
        !isNaN(form.date.getTime());

    const handleSubmit = () => {
        if (!isFormValid) return;

        mutation.mutate({
            name: form.name.trim(),
            value: Number(form.value),
            date: form.date.toISOString(), // local time will be interpreted
            status: form.status,
        });
    };

    return (
        <>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Crear Transacción
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Nueva Transacción</DialogTitle>
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
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setForm((prev) => ({
                                            ...prev,
                                            date: newValue,
                                        }));
                                    }
                                }}
                                slotProps={{
                                    textField: { fullWidth: true },
                                }}
                            />
                        </LocalizationProvider>
                        <TextField
                            select
                            label="Estado"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            fullWidth
                            required
                        >
                            {statuses.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {STATUS_TRANSLATIONS[s]}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                    {mutation.isError && (
                        <Alert severity="error">
                            Error al crear la transacción: {(mutation.error as Error)?.message}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!isFormValid || mutation.isPending}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
