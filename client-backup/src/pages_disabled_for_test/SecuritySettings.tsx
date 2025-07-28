import React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApiKeyManager } from '../components/security/ApiKeyManager';
import { PasswordChange } from '../components/security/PasswordChange';
import { TwoFactorAuth } from '../components/security/TwoFactorAuth';
import { OAuthIntegration } from '../components/security/OAuthIntegration';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('security.title')}
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('security.tabs.password')} />
            <Tab label={t('security.tabs.apiKeys')} />
            <Tab label={t('security.tabs.2fa')} />
            <Tab label={t('security.tabs.oauth')} />
          </Tabs>

          <TabPanel value={value} index={0}>
            <PasswordChange />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <ApiKeyManager />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <TwoFactorAuth />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <OAuthIntegration />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
}; 