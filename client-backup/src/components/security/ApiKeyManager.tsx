import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { ContentCopy, Delete, Add, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SecurityService } from '../../services/security/SecurityService';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

export const ApiKeyManager: React.FC = () => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const securityService = SecurityService.getInstance();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/api-keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(t('apiKey.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      setOpenDialog(false);
      setNewKeyName('');
      setSuccess(t('apiKey.createSuccess'));
    } catch (err) {
      setError(t('apiKey.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/security/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));
      setSuccess(t('apiKey.revokeSuccess'));
    } catch (err) {
      setError(t('apiKey.revokeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              {t('apiKey.title')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              {t('apiKey.create')}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('apiKey.name')}</TableCell>
                  <TableCell>{t('apiKey.key')}</TableCell>
                  <TableCell>{t('apiKey.createdAt')}</TableCell>
                  <TableCell>{t('apiKey.lastUsed')}</TableCell>
                  <TableCell>{t('apiKey.status')}</TableCell>
                  <TableCell>{t('apiKey.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {showKey[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                        <IconButton
                          size="small"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKey[apiKey.id] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(apiKey.lastUsed).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography
                        color={apiKey.status === 'active' ? 'success.main' : 'error.main'}
                      >
                        {t(`apiKey.status.${apiKey.status}`)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {apiKey.status === 'active' && (
                        <IconButton
                          color="error"
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('apiKey.createTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('apiKey.nameLabel')}
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCreateKey}
            variant="contained"
            disabled={!newKeyName || loading}
          >
            {t('common.create')}
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

      <Snackbar
        open={!!copiedKey}
        autoHideDuration={2000}
        onClose={() => setCopiedKey(null)}
      >
        <Alert severity="info" onClose={() => setCopiedKey(null)}>
          {t('apiKey.copied')}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 