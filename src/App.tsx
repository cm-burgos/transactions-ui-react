import React from 'react';
import { ThemeProvider, Container, Typography, Box} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionsTable } from './components/TransactionsTable';
import theme from "./styles/theme";
import {CreateTransactionButton} from "./components/CreateTransactionButton";
import {PayTransactionsButton} from "./components/PayTransactionsButton";

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
              <Box display="flex" flexDirection="row" gap="2rem" >
            <CreateTransactionButton />
            <PayTransactionsButton />
              </Box>
          </Container>
        </ThemeProvider>
      </QueryClientProvider>
  );
};

export default App;
