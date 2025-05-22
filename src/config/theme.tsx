import { createTheme } from '@mui/material/styles';

export const darkGreyTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212', // Dark grey background
            paper: 'transparent',   // Slightly lighter grey for paper components
        },
        primary: {
            main: '#90caf9',    // Light blue primary color
        },
        secondary: {
            main: '#f48fb1',    // Pink secondary color
        },
        text: {
            primary: '#ffffff',
            secondary: '#aaaaaa',
        },
    },
});