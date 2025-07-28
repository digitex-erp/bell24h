import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import RFQList from '../components/rfq/RFQList';
import RFQForm from '../components/rfq/RFQForm';
import RFQDetail from '../components/rfq/RFQDetail';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface RFQPageProps {
  isSupplierView?: boolean;
}

const RFQPage: React.FC<RFQPageProps> = ({ isSupplierView = false }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { hasRole } = useAuth();

  // Determine the base path based on user role
  const basePath = isSupplierView ? '/supplier/rfqs' : '/buyer/rfqs';
  
  // Get the current tab from the URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.endsWith('/new')) return 'new';
    if (path.match(/\/\w+\/\w+\/\w+\/edit/)) return 'edit';
    if (path.match(/\/\w+\/\w+\/\w+$/)) return 'detail';
    return 'list';
  };

  const currentTab = getCurrentTab();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'list') {
      navigate(basePath);
    } else if (newValue === 'new') {
      navigate(`${basePath}/new`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {!isSupplierView && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab === 'list' || currentTab === 'detail' ? 'list' : currentTab}
            onChange={handleTabChange}
            aria-label="RFQ navigation tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            <Tab label={t('rfq.tabs.myRfqs')} value="list" />
            <Tab label={t('rfq.tabs.newRfq')} value="new" />
          </Tabs>
        </Box>
      )}

      <Routes>
        <Route index element={<RFQList isSupplierView={isSupplierView} />} />
        <Route path="new" element={<RFQForm />} />
        <Route path=":id" element={<RFQDetail isSupplierView={isSupplierView} />} />
        <Route path=":id/edit" element={<RFQForm />} />
      </Routes>
    </Container>
  );
};

export default RFQPage;
