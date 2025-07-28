import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MaterialDialog } from './MaterialDialog';
import { Button, TextField, Box, Typography, Stack, Divider, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { PrimaryButton } from './PrimaryButton';

const meta: Meta<typeof MaterialDialog> = {
  title: 'Components/Organisms/MaterialDialog',
  component: MaterialDialog,
  tags: ['autodocs'],
  argTypes: {
    open: { control: false },
    onClose: { action: 'closed' },
    title: { control: 'text' },
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
    },
    fullWidth: { control: 'boolean' },
    fullScreen: { control: 'boolean' },
    dividers: { control: 'boolean' },
    disableBackdropClick: { control: 'boolean' },
    disableEscapeKeyDown: { control: 'boolean' },
  },
  args: {
    title: 'Dialog Title',
    maxWidth: 'sm',
    fullWidth: true,
    fullScreen: false,
    dividers: true,
    disableBackdropClick: false,
    disableEscapeKeyDown: false,
  },
};

export default meta;
type Story = StoryObj<typeof MaterialDialog>;

// Basic dialog example
const BasicDialogExample = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <MaterialDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <PrimaryButton onClick={() => setOpen(false)}>Save</PrimaryButton>
          </>
        }
      >
        <Typography variant="body1" gutterBottom>
          This is a basic dialog with some content. You can put any React node here.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dialog content goes here. You can add forms, text, or any other components.
        </Typography>
      </MaterialDialog>
    </>
  );
};

export const Basic: Story = {
  render: (args) => <BasicDialogExample {...args} />,
};

// Form dialog example
const FormDialogExample = (args: any) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log('Form submitted:', formData);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Form Dialog
      </Button>
      <MaterialDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title="Create New User"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <PrimaryButton onClick={handleSubmit}>Create User</PrimaryButton>
          </>
        }
      >
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
          />
          
          <FormControl fullWidth error={!!errors.role} required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={formData.role}
              label="Role"
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  role: e.target.value,
                }));
                if (errors.role) {
                  setErrors(prev => ({
                    ...prev,
                    role: '',
                  }));
                }
              }}
            >
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>
          
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            multiline
            rows={3}
            fullWidth
          />
        </Stack>
      </MaterialDialog>
    </>
  );
};

export const FormDialog: Story = {
  render: (args) => <FormDialogExample {...args} />,
  args: {
    maxWidth: 'sm',
  },
};

// Confirmation dialog example
const ConfirmationDialogExample = (args: any) => {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => setConfirmed(false), 300);
    }, 1500);
  };

  return (
    <>
      <Button 
        variant="outlined" 
        color="error" 
        onClick={() => setOpen(true)}
      >
        Delete Account
      </Button>
      
      <MaterialDialog
        {...args}
        open={open}
        onClose={() => !confirmed && setOpen(false)}
        title={confirmed ? 'Deleting...' : 'Confirm Deletion'}
        disableBackdropClick={confirmed}
        disableEscapeKeyDown={confirmed}
        actions={
          confirmed ? null : (
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <PrimaryButton 
                color="error"
                onClick={handleConfirm}
                loading={confirmed}
              >
                Delete Permanently
              </PrimaryButton>
            </>
          )
        }
      >
        {confirmed ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              Deleting your account...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a moment. Please don't close this window.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete your account?
            </Typography>
            <Typography variant="body2" color="error">
              This action cannot be undone. All your data will be permanently removed.
            </Typography>
          </>
        )}
      </MaterialDialog>
    </>
  );
};

export const ConfirmationDialog: Story = {
  render: (args) => <ConfirmationDialogExample {...args} />,
};

// Full screen dialog example
const FullScreenDialogExample = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Full Screen Dialog
      </Button>
      
      <MaterialDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        title="Full Screen Dialog"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <PrimaryButton onClick={() => setOpen(false)}>Save</PrimaryButton>
          </>
        }
      >
        <Typography variant="h6" gutterBottom>
          Full Screen Content
        </Typography>
        <Typography paragraph>
          This dialog takes up the full screen. It's useful for complex forms or content
          that requires more space.
        </Typography>
        <Box my={4}>
          <Divider />
        </Box>
        <Typography variant="body1">
          You can add any content here, such as forms, tables, or other components.
          The dialog will be scrollable if the content exceeds the viewport height.
        </Typography>
      </MaterialDialog>
    </>
  );
};

export const FullScreenDialog: Story = {
  render: (args) => <FullScreenDialogExample {...args} />,
  args: {
    fullScreen: true,
  },
};

// Custom styled dialog example
const StyledDialogExample = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          color: 'white',
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          },
        }}
      >
        Open Styled Dialog
      </Button>
      
      <MaterialDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title={
          <Box sx={{ 
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            color: 'white',
            p: 2,
            mx: -3,
            mt: -3,
            mb: 2,
          }}>
            <Typography variant="h6">Custom Styled Dialog</Typography>
          </Box>
        }
        actions={
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <PrimaryButton 
              onClick={() => setOpen(false)}
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  opacity: 0.9,
                },
              }}
            >
              Apply
            </PrimaryButton>
          </Box>
        }
        PaperProps={{
          sx: {
            borderTop: '4px solid',
            borderImage: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%) 1',
            borderRadius: 1,
            overflow: 'hidden',
          },
        }}
      >
        <Typography variant="body1" gutterBottom>
          This dialog has custom styling applied to its header and actions.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can customize the dialog's appearance using the PaperProps and other styling props.
        </Typography>
      </MaterialDialog>
    </>
  );
};

export const StyledDialog: Story = {
  render: (args) => <StyledDialogExample {...args} />,
  args: {
    maxWidth: 'sm',
  },
};
