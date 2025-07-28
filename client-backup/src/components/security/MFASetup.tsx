import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react';
import QRCode from 'qrcode.react';

interface MFAStatus {
  isEnabled: boolean;
  type: 'none' | 'totp' | 'sms' | 'email';
  phoneNumber?: string;
  email?: string;
}

export function MFASetup() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>({
    isEnabled: false,
    type: 'none',
  });
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEnableMFA = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/mfa/setup');
      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.qrCode);
        setShowQR(true);
      } else {
        setError(data.message || 'Failed to enable MFA');
      }
    } catch (error) {
      setError('Failed to enable MFA');
      toast({
        title: 'Error',
        description: 'Failed to enable MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/mfa/verify', {
        code: verificationCode,
      });
      
      if (response.ok) {
        setMfaStatus({ isEnabled: true, type: 'totp' });
        setShowQR(false);
        toast({
          title: 'Success',
          description: 'MFA has been enabled successfully.',
        });
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify MFA');
      toast({
        title: 'Error',
        description: 'Failed to verify MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/mfa/disable');
      
      if (response.ok) {
        setMfaStatus({ isEnabled: false, type: 'none' });
        toast({
          title: 'Success',
          description: 'MFA has been disabled successfully.',
        });
      } else {
        setError('Failed to disable MFA');
      }
    } catch (error) {
      setError('Failed to disable MFA');
      toast({
        title: 'Error',
        description: 'Failed to disable MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mfaStatus.isEnabled ? (
                <ShieldCheck className="text-green-500" />
              ) : (
                <ShieldX className="text-red-500" />
              )}
              <span className="font-medium">
                {mfaStatus.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {mfaStatus.isEnabled ? (
              <Button
                variant="destructive"
                onClick={handleDisableMFA}
                disabled={loading}
              >
                Disable MFA
              </Button>
            ) : (
              <Button
                onClick={handleEnableMFA}
                disabled={loading}
              >
                Enable MFA
              </Button>
            )}
          </div>

          {showQR && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Scan this QR code with your authenticator app
                </p>
                <div className="flex justify-center">
                  <QRCode value={qrCode} size={200} />
                </div>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full p-2 border rounded"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleVerifyMFA}
                  disabled={loading || !verificationCode}
                >
                  Verify
                </Button>
              </div>
            </div>
          )}

          {mfaStatus.isEnabled && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Two-factor authentication adds an extra layer of security to your account.
                You'll need to enter a verification code from your authenticator app
                whenever you sign in.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 