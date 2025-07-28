import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  IconButton, 
  Tooltip,
  ButtonGroup,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';

// Custom Theme Provider
import { CustomThemeProvider, useThemeContext } from './components/ui/ThemeProvider';
import Footer from './components/layout/Footer';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AZRProvider } from './contexts/AZRContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { StitchProvider } from './contexts/StitchContext';
import NotificationProvider from './components/NotificationProvider';

// Lazy-loaded pages
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MarketplacePage = React.lazy(() => import('./pages/marketplace/MarketplacePage'));
const ExplainabilityPage = React.lazy(() => import('./pages/ai/ExplainabilityPage'));
const EscrowPage = React.lazy(() => import('./pages/blockchain/EscrowPage'));
const AZRDemoPage = React.lazy(() => import('./pages/azr/AZRDemoPage'));
const DebugPage = React.lazy(() => import('./pages/DebugPage'));
const StitchTestPage = React.lazy(() => import('./pages/StitchTestPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfServicePage = React.lazy(() => import('./pages/legal/TermsOfService'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

// Navigation bar component with theme toggle
const NavBar = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" color="default" elevation={1}>
      {/* MobileNav is always mounted, but only visible on mobile via CSS. Maintainers: see MobileNav.tsx and MobileNav.css for details. */}
      <MobileNav sx={{ display: { xs: 'block', sm: 'none' } }} />
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <AutoAwesomeIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Bell24H
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ButtonGroup variant="text" size={isMobile ? 'small' : 'medium'}>
            <Button component={Link} to="/" color="inherit">Home</Button>
            <Button component={Link} to="/marketplace" color="inherit">Marketplace</Button>
            <Button component={Link} to="/azr-demo" color="inherit">AZR Demo</Button>
            <Button component={Link} to="/debug" color="inherit">Debug</Button>
          </ButtonGroup>
          
          <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

import ChatWidget from './components/ChatWidget';

// Main App component
const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <AZRProvider>
              <WebSocketProvider>
                <StitchProvider>
                  <NotificationProvider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                      <NavBar />
                      
                      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/marketplace" element={<MarketplacePage />} />
                            <Route path="/explainability" element={<ExplainabilityPage />} />
                            <Route path="/escrow" element={<EscrowPage />} />
                            <Route path="/azr-demo" element={<AZRDemoPage />} />
                            <Route path="/debug" element={<DebugPage />} />
                            <Route path="/stitch-test" element={<StitchTestPage />} />
                            <Route path="/privacy" element={<PrivacyPolicyPage />} />
                            <Route path="/terms" element={<TermsOfServicePage />} />
                          </Routes>
                        </Suspense>
                      </Container>
                      
                      <Footer />
                    </Box>
                  </NotificationProvider>
                </StitchProvider>
              </WebSocketProvider>
            </AZRProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;
