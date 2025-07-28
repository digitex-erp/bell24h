import React, { useState } from 'react';
import { useStitch } from '../contexts/StitchContext';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Container
} from '@mui/material';

const StitchTestPage: React.FC = () => {
  const { stitchClient, isLoading, error } = useStitch();
  const [dbStatus, setDbStatus] = useState<string>('Not connected');

  const testConnection = async () => {
    if (!stitchClient) return;
    
    try {
      const db = stitchClient.getServiceClient(
        window.stitch.RemoteMongoClient.factory,
        'mongodb-atlas'
      ).db('test');
      
      const result = await db.collection('test').findOne({});
      setDbStatus(`Connected! Found ${result ? 'test document' : 'no documents'}`);
    } catch (err) {
      console.error('Database test failed:', err);
      setDbStatus(`Error: ${(err as Error).message}`);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          MongoDB Stitch Connection Test
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to initialize Stitch: {error.message}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Connection Status</Typography>
          <Typography>Stitch: {stitchClient ? '✅ Connected' : '❌ Disconnected'}</Typography>
          <Typography>Database: {dbStatus}</Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={testConnection}
          disabled={!stitchClient}
          sx={{ mr: 2 }}
        >
          Test Database Connection
        </Button>

        {stitchClient && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => console.log('Stitch client:', stitchClient)}
          >
            Log Stitch Client
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default StitchTestPage;
