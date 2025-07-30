import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, CircularProgress, Box
} from '@mui/material';
import { useTransactionsQuery } from '../hooks/useTransactionsQuery';
import { Transaction, TransactionQueryParams } from '../api/transactions';
import {FilterState, TransactionFilters} from "./TransactionFilters";
import {cleanParams} from "../utils";

const columns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Nombre' },
    { id: 'value', label: 'Valor' },
    { id: 'date', label: 'Fecha' },
    { id: 'status', label: 'Estado' },
];

export const TransactionsTable: React.FC = () => {
    const [page, setPage] = useState(0);         // 0-based index
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<FilterState>({
        name: undefined,
        status: undefined,
        from: undefined,
        to: undefined,
    });
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

    useEffect(() => {
        setPage(0); // Reset page when filters change
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
                            {columns?.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.content?.map((row: Transaction) => (
                            <TableRow hover key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                <TableCell>{new Date(row.date).toLocaleString()}</TableCell>
                                <TableCell>{row.status}</TableCell>
                            </TableRow>
                        ))}
                        {data?.content?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={data?.totalElements || 0}
                rowsPerPage={rowsPerPage}
                labelRowsPerPage={"Resultados por página"}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
            />
        </Paper>
        </>
    );
};
