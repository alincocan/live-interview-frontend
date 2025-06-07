import { createTheme, PaletteMode } from '@mui/material/styles';

// Define the dark theme
export const darkGreyTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#101924', // Dark grey background
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

// Define the light theme
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#e8e8e8', // Light grey background
            paper: '#ffffff',   // White for paper components
        },
        primary: {
            main: '#1976d2',    // Blue primary color
        },
        secondary: {
            main: '#e91e63',    // Pink secondary color
        },
        text: {
            primary: '#000000',
            secondary: '#555555',
        },
    },
});

// Create a theme context to manage theme state
export const getThemeByMode = (mode: PaletteMode) => {
    return mode === 'light' ? lightTheme : darkGreyTheme;
};
