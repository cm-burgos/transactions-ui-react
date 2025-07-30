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

const statuses: TransactionStatus[] = ['PENDING', 'PAID', 'REJECTED'];

export const CreateTransactionButton: React.FC = () => {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState<{
        name: string;
        value: number;
        date: Date;
        status: TransactionStatus;
    }>({
        name: '',
        value: 0,
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
                value: 0,
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
            [name]: name === 'value' ? Number(value) : value,
        }));
    };

    const handleSubmit = () => {
        mutation.mutate({
            ...form,
            date: form.date.toISOString(), // send as ISO 8601 with local time interpreted
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
                            fullWidth
                        />
                        <TextField
                            label="Valor"
                            name="value"
                            type="number"
                            value={form.value}
                            onChange={handleChange}
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
                            Error al crear la transacción: {(mutation.error as Error)?.message}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={mutation.isPending}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
