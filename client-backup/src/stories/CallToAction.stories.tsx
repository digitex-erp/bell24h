import type { Meta, StoryObj } from '@storybook/react';
import CallToAction from '../components/cover/CallToAction';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof CallToAction> = {
  title: 'Sections/CallToAction',
  component: CallToAction,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CallToAction>;

export const Default: Story = {
  args: {},
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    theme: 'dark',
  },
};
