import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import {TransactionQueryParams, TransactionStatus} from '../api/transactions';

export type FilterState = Omit<TransactionQueryParams, "size" | "page" | "sort">
type Props = {
    filters: FilterState;
    onChange: (filters: Partial<FilterState>) => void;
};

const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'FAILED', label: 'Fallido' },
];

export const TransactionFilters: React.FC<Props> = ({ filters, onChange }) => {
    const [debouncedName, setDebouncedName] = useState(filters.name || '');

    // Este efecto actualiza el valor externo con debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange({ name: debouncedName });
        }, 500);

        return () => clearTimeout(timeout);
    }, [debouncedName]);

    // Este efecto sincroniza el estado local si cambia desde afuera (por ejemplo, al resetear filtros)
    useEffect(() => {
        setDebouncedName(filters.name || '');
    }, [filters.name]);

    return (
        <Box display="flex" gap={2} mb={2}>
            <TextField
                label="Nombre"
                value={debouncedName}
                onChange={(e) => setDebouncedName(e.target.value)}
                variant="outlined"
                size="small"
            />
            <TextField
                select
                label="Estado"
                value={filters.status}
                onChange={(e) => onChange({ status: e.target.value.length ? e.target.value as TransactionStatus : undefined })}
                variant="outlined"
                size="small"
            >
                {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};
