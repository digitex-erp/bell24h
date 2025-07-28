import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { theme } from '../src/styles/theme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Import your global styles here
import '../src/index.css';

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      light: theme,
    },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  (Story) => (
    <StyledThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </StyledThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
      ],
    },
  },
  layout: 'centered',
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#f5f5f5',
      },
      {
        name: 'dark',
        value: '#333333',
      },
    ],
  },
};
