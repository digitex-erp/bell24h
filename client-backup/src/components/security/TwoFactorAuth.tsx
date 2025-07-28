import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  QRCode
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SecurityService } from '../../services/security/SecurityService';

interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  secret?: string;
  backupCodes?: string[];
}

export const TwoFactorAuth: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<TwoFactorStatus>({
    enabled: false,
    verified: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const securityService = SecurityService.getInstance();

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/2fa/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(t('2fa.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/2fa/setup', {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(prev => ({
        ...prev,
        secret: data.secret,
        backupCodes: data.backupCodes
      }));
      setShowSetupDialog(true);
    } catch (err) {
      setError(t('2fa.setupError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStatus(prev => ({
        ...prev,
        enabled: true,
        verified: true
      }));
      setShowSetupDialog(false);
      setShowBackupCodes(true);
      setSuccess(t('2fa.verifySuccess'));
    } catch (err) {
      setError(t('2fa.verifyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStatus({
        enabled: false,
        verified: false
      });
      setSuccess(t('2fa.disableSuccess'));
    } catch (err) {
      setError(t('2fa.disableError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/2fa/backup-codes', {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(prev => ({
        ...prev,
        backupCodes: data.backupCodes
      }));
      setShowBackupCodes(true);
    } catch (err) {
      setError(t('2fa.backupCodesError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('2fa.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={status.enabled}
                  onChange={status.enabled ? handleDisable2FA : handleEnable2FA}
                  disabled={loading}
                />
              }
              label={t('2fa.enable')}
            />
          </Box>

          {status.enabled && !status.verified && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('2fa.setupInstructions')}
              </Typography>
              <Button
                variant="contained"
                onClick={handleEnable2FA}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('2fa.startSetup')
                )}
              </Button>
            </Box>
          )}

          {status.enabled && status.verified && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleGenerateBackupCodes}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {t('2fa.generateBackupCodes')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDisable2FA}
                disabled={loading}
              >
                {t('2fa.disable')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog
        open={showSetupDialog}
        onClose={() => setShowSetupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('2fa.setupTitle')}</DialogTitle>
        <DialogContent>
          {status.secret && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <QRCode
                value={`otpauth://totp/Bell24H:${encodeURIComponent(
                  'user@example.com'
                )}?secret=${status.secret}&issuer=Bell24H`}
                size={200}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {t('2fa.scanQR')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('2fa.manualEntry')}: {status.secret}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label={t('2fa.verificationCode')}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSetupDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleVerify2FA}
            variant="contained"
            disabled={!verificationCode || loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('2fa.verify')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('2fa.backupCodesTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('2fa.backupCodesWarning')}
          </Typography>
          {status.backupCodes && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                mt: 2
              }}
            >
              {status.backupCodes.map((code, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1
                  }}
                >
                  {code}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodes(false)}>
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(status.backupCodes?.join('\n') || '');
              setSuccess(t('2fa.backupCodesCopied'));
            }}
          >
            {t('common.copy')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 