import type { Meta, StoryObj } from '@storybook/react';
import MarketplaceSection from '../components/cover/MarketplaceSection';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof MarketplaceSection> = {
  title: 'Sections/Marketplace',
  component: MarketplaceSection,
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
type Story = StoryObj<typeof MarketplaceSection>;

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
