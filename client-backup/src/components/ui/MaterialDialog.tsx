import React, { ReactNode, forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  DialogProps as MuiDialogProps,
  Slide,
  SlideProps,
  Divider,
  useMediaQuery,
  useTheme,
  styled,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Transition = forwardRef<HTMLDivElement, SlideProps>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: '100% !important',
    },
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
    '&.no-padding': {
      padding: 0,
    },
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    '&.no-divider': {
      borderTop: 'none',
    },
  },
}));

export interface DialogButtonProps {
  label: string;
  onClick?: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  autoFocus?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface DialogProps extends Omit<MuiDialogProps, 'open' | 'onClose' | 'title'> {
  /**
   * Dialog title
   */
  title?: ReactNode;
  /**
   * Dialog content
   */
  children: ReactNode;
  /**
   * Dialog actions (buttons)
   */
  actions?: DialogButtonProps[];
  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether to show the dialog
   */
  open: boolean;
  /**
   * Callback when dialog is closed
   */
  onClose: () => void;
  /**
   * Whether dialog is loading
   */
  loading?: boolean;
  /**
   * Loading text to display when loading is true
   */
  loadingText?: string;
  /**
   * Whether to show dividers
   * @default true
   */
  dividers?: boolean;
  /**
   * Whether to show the backdrop
   * @default true
   */
  showBackdrop?: boolean;
  /**
   * Whether to show the divider between header and content
   * @default true
   */
  headerDivider?: boolean;
  /**
   * Whether to show the divider between content and actions
   * @default true
   */
  actionsDivider?: boolean;
  /**
   * Maximum width of the dialog
   * @default 'sm'
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /**
   * Whether to show full screen on mobile
   * @default true
   */
  fullScreenMobile?: boolean;
  /**
   * Custom styles for the dialog content
   */
  contentSx?: any;
  /**
   * Whether to disable scroll lock
   * @default false
   */
  disableScrollLock?: boolean;
  /**
   * Whether to disable escape key down
   * @default false
   */
  disableEscapeKeyDown?: boolean;
  /**
   * Whether to disable backdrop click
   * @default false
   */
  disableBackdropClick?: boolean;
}

const MaterialDialog = forwardRef<HTMLDivElement, DialogProps>(({
  title,
  children,
  actions = [],
  showCloseButton = true,
  open,
  onClose,
  loading = false,
  loadingText = 'Loading...',
  dividers = true,
  showBackdrop = true,
  headerDivider = true,
  actionsDivider = true,
  maxWidth = 'sm',
  fullScreenMobile = true,
  contentSx,
  disableScrollLock = false,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  ...props
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isClosing, setIsClosing] = useState(false);

  useImperativeHandle(ref, () => ({
    // You can add methods here to control the dialog from parent
  }));

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return;
    }
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150); // Match the transition duration
  };

  const renderTitle = () => {
    if (!title) return null;
    
    if (typeof title === 'string') {
      return (
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      );
    }
    
    return title;
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={isMobile && fullScreenMobile ? Transition : undefined}
      fullScreen={isMobile && fullScreenMobile}
      maxWidth={maxWidth}
      fullWidth={!!maxWidth}
      hideBackdrop={!showBackdrop}
      disableScrollLock={disableScrollLock}
      disableEscapeKeyDown={disableEscapeKeyDown}
      {...props}
    >
      {title && (
        <DialogTitle 
          sx={{
            pb: headerDivider ? 2 : 0,
            borderBottom: headerDivider ? `1px solid ${theme.palette.divider}` : 'none',
          }}
        >
          {renderTitle()}
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={() => onClose()}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent 
        dividers={dividers}
        sx={{
          position: 'relative',
          minHeight: 100,
          ...contentSx,
        }}
      >
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
            {loadingText && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {loadingText}
              </Typography>
            )}
          </Box>
        ) : null}
        
        <Box sx={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
          {children}
        </Box>
      </DialogContent>
      
      {actions.length > 0 && (
        <DialogActions 
          className={!actionsDivider ? 'no-divider' : ''}
          sx={{
            justifyContent: actions.length === 1 ? 'flex-end' : 'space-between',
            gap: 1,
            '& > * + *': {
              marginLeft: 1,
            },
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              color={action.color || 'primary'}
              variant={action.variant || 'text'}
              disabled={action.disabled || loading}
              startIcon={action.loading ? <CircularProgress size={20} color="inherit" /> : action.startIcon}
              endIcon={action.endIcon}
              type={action.type}
              autoFocus={action.autoFocus}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </StyledDialog>
  );
});

MaterialDialog.displayName = 'MaterialDialog';

export default MaterialDialog;
