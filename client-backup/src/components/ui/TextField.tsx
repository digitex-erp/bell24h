import React, { forwardRef } from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  InputAdornment,
  styled,
  Typography,
  Box,
} from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';

type TextFieldVariant = 'outlined' | 'filled' | 'standard';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant'> {
  variant?: TextFieldVariant;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const StyledTextField = styled(MuiTextField)(({ theme, error }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: error ? theme.palette.error.main : theme.palette.grey[400],
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
      borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },
  },
}));

const CharCounter = ({ current, max }: { current: number; max: number }) => (
  <Typography
    variant="caption"
    color={current > max ? 'error' : 'text.secondary'}
    sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
  >
    {current}/{max}
  </Typography>
);

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      variant = 'outlined',
      startAdornment,
      endAdornment,
      helperText,
      errorMessage,
      maxLength,
      showCharCount = false,
      value = '',
      InputProps,
      InputLabelProps,
      ...props
    },
    ref
  ) => {
    const valueLength = String(value).length;
    const isError = Boolean(errorMessage) || (maxLength ? valueLength > maxLength : false);

    return (
      <Box sx={{ width: '100%' }}>
        <StyledTextField
          ref={ref}
          variant={variant}
          error={isError}
          value={value}
          InputProps={{
            startAdornment: startAdornment ? (
              <InputAdornment position="start">{startAdornment}</InputAdornment>
            ) : undefined,
            endAdornment: errorMessage ? (
              <InputAdornment position="end">
                <ErrorOutlineIcon color="error" fontSize="small" />
              </InputAdornment>
            ) : endAdornment ? (
              <InputAdornment position="end">{endAdornment}</InputAdornment>
            ) : undefined,
            ...InputProps,
          }}
          InputLabelProps={{
            shrink: true,
            ...InputLabelProps,
          }}
          helperText={errorMessage || helperText}
          FormHelperTextProps={{
            error: isError,
            sx: { mt: 0.5, ml: 0, display: 'flex', alignItems: 'center' },
          }}
          {...props}
        />
        {showCharCount && maxLength && (
          <CharCounter current={valueLength} max={maxLength} />
        )}
      </Box>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
