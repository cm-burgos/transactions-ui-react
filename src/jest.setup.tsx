// Mocks for MUI date pickers
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({}));
jest.mock('@mui/x-date-pickers', () => ({
    LocalizationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DateTimePicker: ({ label, value, onChange }: any) => (
        <input
            data-testid="date-picker"
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    ),
    DatePicker: ({ label, value, onChange }: any) => (
        <input
            data-testid="date-picker"
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    ),
    TimePicker: ({ label, value, onChange }: any) => (
        <input
            data-testid="time-picker"
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    ),
}));
