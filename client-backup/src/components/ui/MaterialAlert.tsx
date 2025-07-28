import React from 'react';
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle,
  IconButton,
  Collapse,
  styled,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Severity = 'error' | 'warning' | 'info' | 'success';

export interface MaterialAlertProps extends Omit<MuiAlertProps, 'severity'> {
  severity?: Severity;
  title?: string;
  message: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  showIcon?: boolean;
  variant?: 'filled' | 'outlined' | 'standard';
}

const StyledAlert = styled(MuiAlert)(({ theme, severity = 'info', variant = 'standard' }) => ({
  borderRadius: 8,
  boxShadow: variant === 'standard' ? theme.shadows[1] : 'none',
  '& .MuiAlert-icon': {
    alignItems: 'center',
  },
  '& .MuiAlert-message': {
    width: '100%',
    '& > :not(style) + :not(style)': {
      marginTop: theme.spacing(1),
    },
  },
  ...(variant === 'outlined' && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette[severity].light}`,
    '& .MuiAlert-icon': {
      color: theme.palette[severity].main,
    },
  }),
  ...(variant === 'standard' && {
    backgroundColor: theme.palette[severity].light,
    color: theme.palette.getContrastText(theme.palette[severity].light),
    '& .MuiAlert-icon': {
      color: theme.palette[severity].dark,
    },
  }),
}));

const MaterialAlert: React.FC<MaterialAlertProps> = ({
  severity = 'info',
  title,
  message,
  closable = false,
  onClose,
  autoHideDuration,
  showIcon = true,
  variant = 'standard',
  ...props
}) => {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Collapse in={open}>
      <Box mb={2}>
        <StyledAlert
          severity={severity}
          variant={variant}
          icon={showIcon ? undefined : false}
          action={
            closable ? (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleClose}
                sx={{
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          {...props}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </StyledAlert>
      </Box>
    </Collapse>
  );
};

export default MaterialAlert;
