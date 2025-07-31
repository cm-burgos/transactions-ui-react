import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, CircularProgress, Box, IconButton, Tooltip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTransactionsQuery } from '../hooks/useTransactionsQuery';
import {deleteTransaction, Transaction, TransactionQueryParams} from '../api/transactions';
import { FilterState, TransactionFilters } from './TransactionFilters';
import { cleanParams } from '../utils';
import { EditTransactionDialog } from './EditTransactionDialog';
import {useMutation, useQueryClient } from "@tanstack/react-query";
import {ConfirmActionDialog} from "./ConfirmActionDialog";
const STATUS_TRANSLATIONS = {
   PENDING: "Pendiente",
   PAID: "Pagado",
   REJECTED: "Fallida",
   all: '',
};
export const TransactionsTable: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<FilterState>({
        name: undefined,
        status: undefined,
        from: undefined,
        to: undefined,
    });
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const params: TransactionQueryParams = {
        ...cleanParams(filters),
        page,
        size: rowsPerPage,
        sort: 'date,desc',
    };

    const { data, isLoading, isError } = useTransactionsQuery(params);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            setConfirmDeleteId(null);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });

        },
    });

    useEffect(() => {
        setPage(0);
    }, [filters]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return <p>Error loading transactions.</p>;
    }

    if (!data) {
        return <p>No records found.</p>;
    }

    return (
        <>
            <TransactionFilters
                filters={filters}
                onChange={(updated) => setFilters({ ...filters, ...updated })}
            />
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell data-testid="header-id">ID</TableCell>
                                <TableCell data-testid="header-name">Nombre</TableCell>
                                <TableCell data-testid="header-value">Valor</TableCell>
                                <TableCell data-testid="header-date">Fecha</TableCell>
                                <TableCell data-testid="header-status">Estado</TableCell>
                                <TableCell data-testid="header-actions"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.content.map((row: Transaction) => (
                                <TableRow hover key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.value}</TableCell>
                                    <TableCell>{new Date(row.date).toLocaleString()}</TableCell>
                                    <TableCell>{STATUS_TRANSLATIONS[row.status]}</TableCell>
                                    <TableCell>
                                        {row.status !== 'PAID' && (
                                            <>
                                                <Tooltip title="Editar">
                                                    <IconButton onClick={() => setEditing(row)}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        onClick={() => setConfirmDeleteId(row.id)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.content.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No se encontraron transacciones.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={data.totalElements || 0}
                    rowsPerPage={rowsPerPage}
                    labelRowsPerPage="Resultados por página"
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 20]}
                />
            </Paper>

            {editing && (
                <EditTransactionDialog
                    transaction={editing}
                    onClose={() => setEditing(null)}
                />
            )}
            {confirmDeleteId !== null && (
                <ConfirmActionDialog
                    open={true}
                    title={"Eliminar transacción"}
                    message={`¿Estás seguro de eliminar la transacción #${confirmDeleteId}?`}
                    onClose={() => setConfirmDeleteId(null)}
                    onConfirm={() => {
                        deleteMutation.mutate(confirmDeleteId);
                    }}
                />
            )}
        </>
    );
};
