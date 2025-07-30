import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import {TransactionQueryParams, TransactionStatus} from '../api/transactions';

export type FilterState = Omit<TransactionQueryParams, "size" | "page" | "sort">
type Props = {
    filters: FilterState;
    onChange: (filters: Partial<FilterState>) => void;
};

const statusOptions = [
    { value: 'ALL', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'REJECTED', label: 'Fallido' },
];

export const TransactionFilters: React.FC<Props> = ({ filters, onChange }) => {
    const [debouncedName, setDebouncedName] = useState(filters.name || '');

    const handleClear = () => {
        onChange({
          name: undefined,
          status: undefined,
          from: undefined,
          to: undefined,
        });
        setDebouncedName('');
      };

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange({ name: debouncedName });
        }, 500);

        return () => clearTimeout(timeout);
    }, [debouncedName]);

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
                value={filters.status ?? 'ALL'}
                onChange={(e) =>
                    onChange({
                      status: e.target.value === 'ALL' ? undefined : (e.target.value as TransactionStatus),
                    })
                  }
                  variant="outlined"
                  size="small"
                >
                {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Desde"
                type="date"
                value={filters.from ?? ''}
                onChange={(e) => onChange({ from: e.target.value || undefined })}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                label="Hasta"
                type="date"
                value={filters.to ?? ''}
                onChange={(e) => onChange({ to: e.target.value || undefined })}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" color="secondary" onClick={handleClear}>
      Limpiar
    </Button>
        </Box>
    );
};
