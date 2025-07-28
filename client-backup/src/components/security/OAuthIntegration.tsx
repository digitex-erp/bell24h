import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Microsoft as MicrosoftIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SecurityService } from '../../services/security/SecurityService';

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  email?: string;
  lastUsed?: string;
}

export const OAuthIntegration: React.FC = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<OAuthProvider[]>([
    {
      id: 'google',
      name: 'Google',
      icon: <GoogleIcon />,
      connected: false
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <GitHubIcon />,
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      connected: false
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: <MicrosoftIcon />,
      connected: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState<{
    open: boolean;
    provider: OAuthProvider | null;
  }>({
    open: false,
    provider: null
  });

  const securityService = SecurityService.getInstance();

  useEffect(() => {
    fetchOAuthStatus();
  }, []);

  const fetchOAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/oauth/status');
      const data = await response.json();
      
      setProviders(prevProviders =>
        prevProviders.map(provider => ({
          ...provider,
          ...data[provider.id]
        }))
      );
    } catch (err) {
      setError(t('oauth.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/security/oauth/${providerId}/connect`);
      const data = await response.json();
      
      // Redirect to OAuth provider's authorization page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(t('oauth.connectError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider: OAuthProvider) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/security/oauth/${provider.id}/disconnect`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect OAuth provider');
      }

      setProviders(prevProviders =>
        prevProviders.map(p =>
          p.id === provider.id
            ? { ...p, connected: false, email: undefined, lastUsed: undefined }
            : p
        )
      );

      setShowDisconnectDialog({ open: false, provider: null });
      setSuccess(t('oauth.disconnectSuccess'));
    } catch (err) {
      setError(t('oauth.disconnectError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('oauth.title')}
          </Typography>

          <List>
            {providers.map((provider) => (
              <ListItem key={provider.id}>
                <ListItemIcon>{provider.icon}</ListItemIcon>
                <ListItemText
                  primary={provider.name}
                  secondary={
                    provider.connected
                      ? `${t('oauth.connectedAs')} ${provider.email}`
                      : t('oauth.notConnected')
                  }
                />
                <ListItemSecondaryAction>
                  {provider.connected ? (
                    <IconButton
                      edge="end"
                      aria-label="disconnect"
                      onClick={() =>
                        setShowDisconnectDialog({ open: true, provider })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      onClick={() => handleConnect(provider.id)}
                      disabled={loading}
                    >
                      {t('oauth.connect')}
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={showDisconnectDialog.open}
        onClose={() => setShowDisconnectDialog({ open: false, provider: null })}
      >
        <DialogTitle>{t('oauth.disconnectTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('oauth.disconnectConfirm', {
              provider: showDisconnectDialog.provider?.name
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDisconnectDialog({ open: false, provider: null })}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() =>
              showDisconnectDialog.provider &&
              handleDisconnect(showDisconnectDialog.provider)
            }
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('oauth.disconnect')
            )}
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