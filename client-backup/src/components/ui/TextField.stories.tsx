import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextField as MuiTextField } from './TextField';
import { Box, Stack, Typography } from '@mui/material';

const meta: Meta<typeof MuiTextField> = {
  title: 'Components/Atoms/Inputs/TextField',
  component: MuiTextField,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'filled', 'standard'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium'],
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    required: { control: 'boolean' },
    multiline: { control: 'boolean' },
    rows: { control: { type: 'number', min: 1, max: 10 } },
    maxLength: { control: { type: 'number', min: 1, max: 1000 } },
  },
  args: {
    variant: 'outlined',
    size: 'medium',
    type: 'text',
    label: 'Label',
    placeholder: 'Placeholder',
    helperText: 'Helper text',
    error: false,
    disabled: false,
    fullWidth: false,
    required: false,
    multiline: false,
    rows: 4,
    maxLength: 100,
  },
};

export default meta;
type Story = StoryObj<typeof MuiTextField>;

// Basic template with state management
const Template: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <MuiTextField 
        {...args} 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
      />
    );
  },
};

export const Default = Template;

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} maxWidth={400}>
      <MuiTextField 
        label="Outlined (Default)" 
        variant="outlined" 
        placeholder="Outlined variant" 
      />
      <MuiTextField 
        label="Filled" 
        variant="filled" 
        placeholder="Filled variant" 
      />
      <MuiTextField 
        label="Standard" 
        variant="standard" 
        placeholder="Standard variant" 
      />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3} maxWidth={400}>
      <MuiTextField 
        label="Small" 
        size="small" 
        placeholder="Small size" 
      />
      <MuiTextField 
        label="Medium (Default)" 
        size="medium" 
        placeholder="Medium size" 
      />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack spacing={3} maxWidth={400}>
      <MuiTextField 
        label="Normal" 
        placeholder="Normal state" 
      />
      <MuiTextField 
        label="Disabled" 
        placeholder="Disabled state" 
        disabled 
      />
      <MuiTextField 
        label="Error" 
        placeholder="Error state" 
        error 
        helperText="This field is required"
      />
      <MuiTextField 
        label="Required" 
        placeholder="Required field" 
        required 
        helperText="This field is required"
      />
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => {
    const SearchIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    );

    const VisibilityIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    );

    return (
      <Stack spacing={3} maxWidth={400}>
        <MuiTextField 
          label="Search" 
          placeholder="Search..."
          startAdornment={<SearchIcon />}
        />
        <MuiTextField 
          type="password"
          label="Password" 
          placeholder="Enter password"
          endAdornment={<VisibilityIcon />}
        />
      </Stack>
    );
  },
};

export const WithCharacterCounter: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 100;
    
    return (
      <MuiTextField
        label="Description"
        placeholder="Enter description"
        multiline
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        helperText={`${value.length}/${maxLength} characters`}
        fullWidth
      />
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [form, setForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    return (
      <Box component="form" noValidate autoComplete="off" sx={{ maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          Contact Form
        </Typography>
        <Stack spacing={3}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <MuiTextField
              label="First Name"
              value={form.firstName}
              onChange={handleChange('firstName')}
              required
            />
            <MuiTextField
              label="Last Name"
              value={form.lastName}
              onChange={handleChange('lastName')}
              required
            />
          </Box>
          <MuiTextField
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
            helperText="We'll never share your email"
          />
          <MuiTextField
            label="Message"
            multiline
            rows={4}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Enter your message here..."
            required
          />
          <Box>
            <PrimaryButton>Submit</PrimaryButton>
          </Box>
        </Stack>
      </Box>
    );
  },
};
