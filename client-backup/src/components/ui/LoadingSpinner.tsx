import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = true }) => {
  return (
    <Box 
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={fullScreen ? '100vh' : 'auto'}
      py={fullScreen ? 0 : 8}
    >
      <CircularProgress size={fullScreen ? 60 : 40} />
    </Box>
  );
};
