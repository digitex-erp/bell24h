import type { Meta, StoryObj } from '@storybook/react';
import { PrimaryButton } from './PrimaryButton';
import { Box, Stack } from '@mui/material';

const meta: Meta<typeof PrimaryButton> = {
  title: 'Components/Atoms/Buttons/PrimaryButton',
  component: PrimaryButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['text', 'outlined', 'contained'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
    fullWidth: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof PrimaryButton>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Stack spacing={2} maxWidth={300}>
      <PrimaryButton {...args} variant="contained">
        Contained
      </PrimaryButton>
      <PrimaryButton {...args} variant="outlined">
        Outlined
      </PrimaryButton>
      <PrimaryButton {...args} variant="text">
        Text
      </PrimaryButton>
    </Stack>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <Box display="grid" gap={2} gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))">
      <PrimaryButton color="primary" variant="contained">
        Primary
      </PrimaryButton>
      <PrimaryButton color="secondary" variant="contained">
        Secondary
      </PrimaryButton>
      <PrimaryButton color="success" variant="contained">
        Success
      </PrimaryButton>
      <PrimaryButton color="error" variant="contained">
        Error
      </PrimaryButton>
      <PrimaryButton color="warning" variant="contained">
        Warning
      </PrimaryButton>
      <PrimaryButton color="info" variant="contained">
        Info
      </PrimaryButton>
    </Box>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack spacing={2} alignItems="flex-start">
      <PrimaryButton {...args} size="small">
        Small
      </PrimaryButton>
      <PrimaryButton {...args} size="medium">
        Medium
      </PrimaryButton>
      <PrimaryButton {...args} size="large">
        Large
      </PrimaryButton>
    </Stack>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const WithIcons: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <PrimaryButton
        startIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        }
      >
        Add Item
      </PrimaryButton>
      <PrimaryButton
        endIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        }
      >
        Next
      </PrimaryButton>
    </Stack>
  ),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};

const Template: Story = {
  render: (args) => <PrimaryButton {...args} />,
};

export const CustomStyles = {
  ...Template,
  args: {
    children: 'Custom Styled',
    sx: {
      borderRadius: '20px',
      textTransform: 'none',
      boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 118, 255, 0.23)',
      },
    },
  },
};
