import React from 'react';
import { ThemeProvider, Container, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionsTable } from './components/TransactionsTable';
import theme from "./styles/theme";
import {CreateTransactionButton} from "./components/CreateTransactionButton";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Transacciones
            </Typography>
            <TransactionsTable />
            <CreateTransactionButton />
          </Container>
        </ThemeProvider>
      </QueryClientProvider>
  );
};

export default App;
