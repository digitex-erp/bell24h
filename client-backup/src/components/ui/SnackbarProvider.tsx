import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Snackbar as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
  Alert,
  AlertColor,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

type SnackbarSeverity = AlertColor;

export interface SnackbarMessage {
  key: number;
  message: React.ReactNode;
  severity?: SnackbarSeverity;
  title?: string;
  action?: React.ReactNode;
  autoHideDuration?: number | null;
  persist?: boolean;
  width?: number | string;
  maxWidth?: number | string;
  variant?: 'standard' | 'filled' | 'outlined';
  elevation?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
}

type SnackbarContextType = {
  showMessage: (message: Omit<SnackbarMessage, 'key'>) => void;
  showSuccess: (message: string, options?: Omit<SnackbarMessage, 'message' | 'severity'>) => void;
  showError: (message: string, options?: Omit<SnackbarMessage, 'message' | 'severity'>) => void;
  showWarning: (message: string, options?: Omit<SnackbarMessage, 'message' | 'severity'>) => void;
  showInfo: (message: string, options?: Omit<SnackbarMessage, 'message' | 'severity'>) => void;
  closeSnackbar: (key?: number) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

type TransitionProps = Omit<SlideProps, 'direction'>;

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}

const StyledAlert = styled(Alert)(({ theme, severity = 'info', variant = 'standard' }) => ({
  width: '100%',
  maxWidth: 500,
  borderRadius: 8,
  boxShadow: theme.shadows[4],
  '& .MuiAlert-message': {
    width: '100%',
  },
  ...(variant === 'outlined' && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette[severity as keyof typeof theme.palette]?.light || theme.palette.divider}`,
  }),
  ...(variant === 'standard' && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  }),
}));

const StyledSnackbar = styled(MuiSnackbar)(({ theme }) => ({
  '&.MuiSnackbar-root': {
    [theme.breakpoints.up('sm')]: {
      right: 16,
      bottom: 16,
      left: 'auto',
      transform: 'none',
    },
  },
  '& .MuiSnackbarContent-root': {
    width: '100%',
    maxWidth: '100%',
    padding: 0,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    minWidth: 'auto',
  },
}));

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [currentSnack, setCurrentSnack] = useState<SnackbarMessage | null>(null);

  const processQueue = useCallback(() => {
    if (snackPack.length > 0 && !currentSnack) {
      setCurrentSnack({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [snackPack, currentSnack]);

  const showMessage = useCallback((message: Omit<SnackbarMessage, 'key'>) => {
    const newSnack = {
      ...message,
      key: new Date().getTime(),
      autoHideDuration: message.autoHideDuration ?? 6000,
    };

    setSnackPack((prev) => [...prev, newSnack]);
  }, []);

  const showSuccess = useCallback(
    (message: string, options: Omit<SnackbarMessage, 'message' | 'severity'> = {}) => {
      showMessage({
        ...options,
        message,
        severity: 'success',
      });
    },
    [showMessage]
  );

  const showError = useCallback(
    (message: string, options: Omit<SnackbarMessage, 'message' | 'severity'> = {}) => {
      showMessage({
        ...options,
        message,
        severity: 'error',
        autoHideDuration: options.autoHideDuration ?? 10000,
      });
    },
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string, options: Omit<SnackbarMessage, 'message' | 'severity'> = {}) => {
      showMessage({
        ...options,
        message,
        severity: 'warning',
      });
    },
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string, options: Omit<SnackbarMessage, 'message' | 'severity'> = {}) => {
      showMessage({
        ...options,
        message,
        severity: 'info',
      });
    },
    [showMessage]
  );

  const closeSnackbar = useCallback((key?: number) => {
    if (key) {
      setSnackPack((prev) => prev.filter((snack) => snack.key !== key));
      if (currentSnack?.key === key) {
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  }, [currentSnack]);

  const handleClose = useCallback((event: React.SyntheticEvent | Event, reason?: string, key?: number) => {
    if (reason === 'clickaway') {
      return;
    }
    if (key) {
      closeSnackbar(key);
    } else {
      setOpen(false);
    }
  }, [closeSnackbar]);

  const handleExited = useCallback(() => {
    setCurrentSnack(null);
  }, []);

  // Process queue when it changes
  React.useEffect(() => {
    if (snackPack.length > 0 && !currentSnack) {
      processQueue();
    } else if (snackPack.length > 0 && currentSnack && open === false) {
      setOpen(false);
    }
  }, [snackPack, currentSnack, open, processQueue]);

  const contextValue = useMemo(
    () => ({
      showMessage,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      closeSnackbar,
    }),
    [showMessage, showSuccess, showError, showWarning, showInfo, closeSnackbar]
  );

  if (!currentSnack) return <SnackbarContext.Provider value={contextValue}>{children}</SnackbarContext.Provider>;

  const {
    key,
    message,
    severity = 'info',
    title,
    action,
    autoHideDuration,
    persist = false,
    width = isMobile ? 'calc(100% - 32px)' : 400,
    maxWidth = '100%',
    variant = 'standard',
    elevation = 4,
    showCloseButton = true,
    onClose,
  } = currentSnack;

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <StyledSnackbar
        key={key}
        open={open}
        autoHideDuration={persist ? null : autoHideDuration}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
        style={{
          width: isMobile ? '100%' : width,
          maxWidth: isMobile ? '100%' : maxWidth,
          margin: isMobile ? 0 : '16px',
        }}
        ClickAwayListenerProps={{
          mouseEvent: false,
          touchEvent: false,
        }}
        TransitionProps={{
          onExited: handleExited,
        }}
      >
        <div>
          <StyledAlert
            severity={severity}
            variant={variant}
            elevation={elevation}
            action={
              <>
                {action}
                {showCloseButton && (
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={(e) => {
                      handleClose(e, 'click', key);
                      onClose?.();
                    }}
                    sx={{
                      padding: '4px',
                      marginLeft: 1,
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            }
          >
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
          </StyledAlert>
        </div>
      </StyledSnackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export default SnackbarProvider;
