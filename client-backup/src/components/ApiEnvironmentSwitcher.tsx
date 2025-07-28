import React, { useEffect, useState } from 'react';
import { Switch, FormControl, FormLabel, FormControlLabel, Box, Typography, Badge, Alert } from '@mui/material';
import { isTestMode } from '@/lib/api-config';
import { perplexityApi } from '@/lib/api';

interface ApiEnvironmentSwitcherProps {
  onEnvironmentChange?: (isTestEnv: boolean) => void;
}

/**
 * Environment switcher component that allows toggling between production
 * and test API environments for development purposes
 */
const ApiEnvironmentSwitcher: React.FC<ApiEnvironmentSwitcherProps> = ({ 
  onEnvironmentChange 
}) => {
  const [useTestApi, setUseTestApi] = useState<boolean>(isTestMode());
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [lastChecked, setLastChecked] = useState<string>('');

  // Check the API status on component mount and when environment changes
  useEffect(() => {
    checkApiConnection();
  }, [useTestApi]);

  // Set URL parameter when toggling environment
  const handleToggleEnvironment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseTestApi(newValue);
    
    // Update URL parameter for persistence through page refreshes
    const url = new URL(window.location.href);
    if (newValue) {
      url.searchParams.set('useTestApi', 'true');
    } else {
      url.searchParams.delete('useTestApi');
    }
    window.history.replaceState({}, '', url.toString());
    
    // Notify parent component
    if (onEnvironmentChange) {
      onEnvironmentChange(newValue);
    }
  };

  // Test API connection to verify connectivity
  const checkApiConnection = async () => {
    setApiStatus('loading');
    
    try {
      const response = await perplexityApi.testApiConnection();
      setApiStatus(response.status === 'success' ? 'connected' : 'error');
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiStatus('error');
    }
    
    setLastChecked(new Date().toLocaleTimeString());
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        p: 2,
        bgcolor: useTestApi ? 'rgba(255, 244, 229, 0.5)' : 'transparent',
        borderRadius: 1,
        border: useTestApi ? '1px dashed orange' : 'none',
      }}
    >
      <FormControl component="fieldset" variant="standard">
        <FormControlLabel
          control={
            <Switch
              checked={useTestApi}
              onChange={handleToggleEnvironment}
              color="warning"
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                {useTestApi ? 'Test API' : 'Production API'}
              </Typography>
              <Badge
                variant="dot"
                color={apiStatus === 'connected' ? 'success' : apiStatus === 'loading' ? 'info' : 'error'}
                sx={{ ml: 1 }}
              />
            </Box>
          }
        />
      </FormControl>
      
      {useTestApi && (
        <Alert 
          severity="info" 
          sx={{ mt: 1, py: 0.5 }} 
          icon={false}
        >
          <Typography variant="caption">
            Using test server at port 3001. Last check: {lastChecked}
            {apiStatus === 'connected' ? ' (Connected)' : apiStatus === 'loading' ? ' (Checking...)' : ' (Connection error)'}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ApiEnvironmentSwitcher;
