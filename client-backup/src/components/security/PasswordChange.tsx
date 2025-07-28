import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SecurityService } from '../../services/security/SecurityService';

export const PasswordChange: React.FC = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string;
  } | null>(null);

  const securityService = SecurityService.getInstance();

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    let feedback = [];

    if (password.length >= minLength) score++;
    else feedback.push(t('password.minLength'));

    if (hasUpperCase) score++;
    else feedback.push(t('password.uppercase'));

    if (hasLowerCase) score++;
    else feedback.push(t('password.lowercase'));

    if (hasNumbers) score++;
    else feedback.push(t('password.numbers'));

    if (hasSpecialChar) score++;
    else feedback.push(t('password.specialChar'));

    return {
      score,
      feedback: feedback.join(', ')
    };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t('password.mismatch'));
      return;
    }

    const validation = validatePassword(newPassword);
    if (validation.score < 3) {
      setError(t('password.weak'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/security/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setSuccess(t('password.changeSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
    } catch (err) {
      setError(t('password.changeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(validatePassword(password));
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'error.main';
      case 2:
        return 'warning.main';
      case 3:
        return 'info.main';
      case 4:
      case 5:
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('password.title')}
          </Typography>

          <form onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              margin="normal"
              label={t('password.current')}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              label={t('password.new')}
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />

            {passwordStrength && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography
                  variant="body2"
                  color={getPasswordStrengthColor(passwordStrength.score)}
                >
                  {t('password.strength')}: {passwordStrength.score}/5
                </Typography>
                {passwordStrength.feedback && (
                  <Typography variant="caption" color="text.secondary">
                    {passwordStrength.feedback}
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              margin="normal"
              label={t('password.confirm')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('password.change')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

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