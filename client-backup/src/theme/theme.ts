import { createTheme } from '@mui/material/styles';

// Create a theme instance for Bell24H
const theme = createTheme({
  palette: {
    primary: {
      main: '#1890ff', // Main brand color
      light: '#40a9ff',
      dark: '#096dd9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#52c41a', // Secondary brand color
      light: '#73d13d',
      dark: '#389e0d',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff4d4f',
    },
    warning: {
      main: '#faad14',
    },
    info: {
      main: '#1890ff',
    },
    success: {
      main: '#52c41a',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system', 
      'BlinkMacSystemFont', 
      '"Segoe UI"', 
      'Roboto', 
      '"Helvetica Neue"', 
      'Arial', 
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#666666',
    },
    subtitle2: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Don't uppercase button text by default
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#40a9ff',
          },
        },
        outlinedPrimary: {
          borderColor: '#1890ff',
          '&:hover': {
            backgroundColor: 'rgba(24, 144, 255, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          '@media (max-width: 600px)': {
            padding: '12px 8px',
          },
        },
      },
    },
  },
});

export default theme;
