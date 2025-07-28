import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean;
}

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  textTransform: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: 1.75,
  letterSpacing: '0.02857em',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  ...(variant === 'contained' && {
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  }),
  ...(variant === 'outlined' && {
    border: '1px solid',
    '&:hover': {
      border: '1px solid',
      backgroundColor: 'transparent',
    },
  }),
  ...(variant === 'text' && {
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  }),
}));

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <StyledButton
      disabled={disabled || loading}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              color: (theme) =>
                props.variant === 'contained'
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
            }}
          />
          <span style={{ opacity: 0 }}>{children}</span>
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default PrimaryButton;
