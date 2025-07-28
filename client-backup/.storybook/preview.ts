import type { Preview } from '@storybook/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from '../src/styles/theme';

// Import your global styles here
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
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
          value: '#1a1a1a',
        },
      ],
    },
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Pages'],
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        light: theme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
    (Story) => (
      <EmotionThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </EmotionThemeProvider>
    ),
  ],
};

export default preview;
