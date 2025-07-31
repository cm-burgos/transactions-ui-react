import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../../styles/theme';

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

export const renderWithProviders = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => {
    const queryClient = createTestQueryClient();

    const Wrapper: React.FC<PropsWithChildren<{}>> = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
};
