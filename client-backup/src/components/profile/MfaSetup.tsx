import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, TextField, CircularProgress, Box, Typography } from '@mui/material';
import Image from 'next/image';

export const MfaSetup = () => {
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/generate-secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
      } else {
        console.error('Failed to generate MFA secret');
      }
    } catch (error) {
      console.error('Error generating MFA secret:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ token, secret }),
      });

      if (response.ok) {
        setIsVerified(true);
        // TODO: Update user MFA status in backend
      } else {
        console.error('MFA verification failed');
      }
    } catch (error) {
      console.error('Error verifying MFA token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Multi-Factor Authentication</Typography>
      {!qrCode ? (
        <Button
          variant="contained"
          onClick={handleGenerateSecret}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Enable MFA'}
        </Button>
      ) : (
        <>
          <Typography variant="body1">Scan this QR code with your authenticator app:</Typography>
          <Image src={qrCode} alt="MFA QR Code" width={200} height={200} />
          <Typography variant="body1">Or enter this secret manually: {secret}</Typography>
          <TextField
            label="Verification Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleVerifyToken}
            disabled={isLoading || !token}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Verify and Enable'}
          </Button>
        </>
      )}
      {isVerified && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          MFA has been successfully enabled!
        </Typography>
      )}
    </Box>
  );
};
