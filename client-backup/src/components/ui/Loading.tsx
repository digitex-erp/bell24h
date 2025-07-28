import React from 'react';
import { Box, CircularProgress, Typography, Fade, SxProps, Theme } from '@mui/material';

interface LoadingProps {
  /**
   * If true, the loading indicator will be shown
   */
  loading?: boolean;
  /**
   * The size of the loading indicator
   * @default 40
   */
  size?: number;
  /**
   * The thickness of the loading indicator
   * @default 4
   */
  thickness?: number;
  /**
   * Custom message to display below the loading indicator
   */
  message?: string;
  /**
   * If true, the loading indicator will be centered in its container
   * @default true
   */
  center?: boolean;
  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
  /**
   * Additional content to be rendered with the loading indicator
   */
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({
  loading = true,
  size = 40,
  thickness = 4,
  message,
  center = true,
  sx,
  children,
}) => {
  if (!loading) return <>{children}</>;

  return (
    <Fade in={loading} style={{ transitionDelay: loading ? '200ms' : '0ms' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: center ? 'center' : 'flex-start',
          justifyContent: center,
          width: '100%',
          height: '100%',
          minHeight: 200,
          ...sx,
        }}
      >
        <CircularProgress
          size={size}
          thickness={thickness}
          color="primary"
          sx={{
            mb: message ? 2 : 0,
            color: (theme) => theme.palette.primary.main,
          }}
        />
        {message && (
          <Typography
            variant="body1"
            color="text.secondary"
            align={center ? 'center' : 'left'}
            sx={{ maxWidth: 300 }}
          >
            {message}
          </Typography>
        )}
        {children}
      </Box>
    </Fade>
  );
};

export default Loading;
