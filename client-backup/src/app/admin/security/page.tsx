'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionPolicy: {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  accessControl: {
    mfaRequired: boolean;
    ipWhitelist: string[];
    allowedDomains: string[];
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'info' | 'warning' | 'error';
  };
  apiSecurity: {
    rateLimitEnabled: boolean;
    rateLimitRequests: number;
    rateLimitWindow: number;
    corsEnabled: boolean;
    allowedOrigins: string[];
  };
}

interface SecurityStatus {
  overall: 'secure' | 'warning' | 'critical';
  passwordPolicy: 'secure' | 'warning' | 'critical';
  sessionPolicy: 'secure' | 'warning' | 'critical';
  accessControl: 'secure' | 'warning' | 'critical';
  auditLogging: 'secure' | 'warning' | 'critical';
  apiSecurity: 'secure' | 'warning' | 'critical';
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export default function SecurityPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError('');

      const [settingsResponse, statusResponse, eventsResponse] = await Promise.all([
        fetch('/api/admin/security/settings'),
        fetch('/api/admin/security/status'),
        fetch('/api/admin/security/events'),
      ]);

      if (!settingsResponse.ok || !statusResponse.ok || !eventsResponse.ok) {
        throw new Error('Failed to fetch security data');
      }

      const [settingsData, statusData, eventsData] = await Promise.all([
        settingsResponse.json(),
        statusResponse.json(),
        eventsResponse.json(),
      ]);

      setSettings(settingsData);
      setStatus(statusData);
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load security data');
      console.error('Error fetching security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccess('Security settings updated successfully');
      await fetchSecurityData();
    } catch (err) {
      setError('Failed to save security settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSecurity = async () => {
    try {
      const response = await fetch('/api/admin/security/test', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Security test failed');

      setSuccess('Security test completed successfully');
    } catch (err) {
      setError('Security test failed');
      console.error('Error testing security:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'error';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission={{ action: 'view', resource: 'security' }}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Security Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure security policies and access controls
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSecurityData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShieldIcon />}
                onClick={() => setTestDialogOpen(true)}
              >
                Test Security
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                Save Settings
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Security Status */}
          {status && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h6">Security Status</Typography>
                {getStatusIcon(status.overall)}
                <Chip
                  label={status.overall.toUpperCase()}
                  color={getStatusColor(status.overall) as any}
                  size="small"
                />
              </Box>
              <Grid container spacing={3}>
                {Object.entries(status).map(([key, value]) => {
                  if (key === 'overall') return null;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(value)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Chip
                          label={value.toUpperCase()}
                          color={getStatusColor(value) as any}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}

          {settings && (
            <Grid container spacing={3}>
              {/* Password Policy */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <LockIcon color="primary" />
                    <Typography variant="h6">Password Policy</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Minimum Length"
                        type="number"
                        value={settings.passwordPolicy.minLength}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            passwordPolicy: {
                              ...settings.passwordPolicy,
                              minLength: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Age (days)"
                        type="number"
                        value={settings.passwordPolicy.maxAge}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            passwordPolicy: {
                              ...settings.passwordPolicy,
                              maxAge: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.passwordPolicy.requireUppercase}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                passwordPolicy: {
                                  ...settings.passwordPolicy,
                                  requireUppercase: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Uppercase Letters"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.passwordPolicy.requireLowercase}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                passwordPolicy: {
                                  ...settings.passwordPolicy,
                                  requireLowercase: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Lowercase Letters"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.passwordPolicy.requireNumbers}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                passwordPolicy: {
                                  ...settings.passwordPolicy,
                                  requireNumbers: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Numbers"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.passwordPolicy.requireSpecialChars}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                passwordPolicy: {
                                  ...settings.passwordPolicy,
                                  requireSpecialChars: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Special Characters"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Session Policy */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <VpnKeyIcon color="primary" />
                    <Typography variant="h6">Session Policy</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Session Duration (hours)"
                        type="number"
                        value={settings.sessionPolicy.maxSessionDuration}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            sessionPolicy: {
                              ...settings.sessionPolicy,
                              maxSessionDuration: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Idle Timeout (minutes)"
                        type="number"
                        value={settings.sessionPolicy.idleTimeout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            sessionPolicy: {
                              ...settings.sessionPolicy,
                              idleTimeout: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Concurrent Sessions"
                        type="number"
                        value={settings.sessionPolicy.maxConcurrentSessions}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            sessionPolicy: {
                              ...settings.sessionPolicy,
                              maxConcurrentSessions: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.sessionPolicy.requireReauth}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                sessionPolicy: {
                                  ...settings.sessionPolicy,
                                  requireReauth: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Re-authentication for Sensitive Actions"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Access Control */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <ShieldIcon color="primary" />
                    <Typography variant="h6">Access Control</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.accessControl.mfaRequired}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                accessControl: {
                                  ...settings.accessControl,
                                  mfaRequired: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Require Multi-Factor Authentication"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        value={settings.accessControl.maxLoginAttempts}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            accessControl: {
                              ...settings.accessControl,
                              maxLoginAttempts: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Lockout Duration (minutes)"
                        type="number"
                        value={settings.accessControl.lockoutDuration}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            accessControl: {
                              ...settings.accessControl,
                              lockoutDuration: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="IP Whitelist (comma-separated)"
                        value={settings.accessControl.ipWhitelist.join(', ')}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            accessControl: {
                              ...settings.accessControl,
                              ipWhitelist: e.target.value.split(',').map(ip => ip.trim()),
                            },
                          })
                        }
                        helperText="Leave empty to allow all IPs"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* API Security */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <KeyIcon color="primary" />
                    <Typography variant="h6">API Security</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.apiSecurity.rateLimitEnabled}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                apiSecurity: {
                                  ...settings.apiSecurity,
                                  rateLimitEnabled: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Enable Rate Limiting"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Rate Limit Requests"
                        type="number"
                        value={settings.apiSecurity.rateLimitRequests}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            apiSecurity: {
                              ...settings.apiSecurity,
                              rateLimitRequests: parseInt(e.target.value),
                            },
                          })
                        }
                        disabled={!settings.apiSecurity.rateLimitEnabled}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Rate Limit Window (seconds)"
                        type="number"
                        value={settings.apiSecurity.rateLimitWindow}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            apiSecurity: {
                              ...settings.apiSecurity,
                              rateLimitWindow: parseInt(e.target.value),
                            },
                          })
                        }
                        disabled={!settings.apiSecurity.rateLimitEnabled}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.apiSecurity.corsEnabled}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                apiSecurity: {
                                  ...settings.apiSecurity,
                                  corsEnabled: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Enable CORS"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Recent Security Events */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recent Security Events
            </Typography>
            <List>
              {events.slice(0, 10).map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemIcon>
                    <Chip
                      label={event.severity.toUpperCase()}
                      color={getSeverityColor(event.severity) as any}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.event}
                    secondary={`${event.user} - ${event.ip} - ${new Date(event.timestamp).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Test Security Dialog */}
          <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)}>
            <DialogTitle>Test Security Configuration</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                This will run a comprehensive security test to verify your configuration is working correctly.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleTestSecurity} variant="contained">
                Run Test
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 