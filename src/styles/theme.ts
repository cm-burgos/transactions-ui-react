import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6C4EB1',
            light: '#8C78E1',
            dark: '#3A2572',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#FF6A5C',
            light: '#FF8C7F',
            dark: '#CC5448',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#FFFFFF',
            paper:    '#F9F9FC',
        },
        text: {
            primary:   '#0A0F3D',
            secondary: '#8C8FA0',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
            color: '#0A0F3D',
        },
        subtitle1: {
            fontSize: '1.25rem',
            color: '#8C8FA0',
        },
        body1: {
            fontSize: '1rem',
            color: '#0A0F3D',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '8px 24px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default theme;
