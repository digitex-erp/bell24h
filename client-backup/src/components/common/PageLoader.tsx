import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      gap={2}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};

export default PageLoader;
