// src/pages/SupplierManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container,
  CircularProgress,
  Button
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import SuppliersList from '../components/suppliers/SuppliersList.js';
import SupplierDetails from '../components/suppliers/SupplierDetails.js';
import SupplierDashboard from '../components/suppliers/SupplierDashboard.js';
import { getSuppliers, getSuppliersByTier, SupplierTier, Supplier } from '../utils/supplierRatingService.js';

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
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `supplier-tab-${index}`,
    'aria-controls': `supplier-tabpanel-${index}`,
  };
}

const SupplierManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, [tabValue]);

  const loadSuppliers = () => {
    setLoading(true);
    let filteredSuppliers: Supplier[];

    switch (tabValue) {
      case 0: // All Suppliers
        filteredSuppliers = getSuppliers();
        break;
      case 1: // Platinum Suppliers
        filteredSuppliers = getSuppliersByTier(SupplierTier.PLATINUM);
        break;
      case 2: // Gold Suppliers
        filteredSuppliers = getSuppliersByTier(SupplierTier.GOLD);
        break;
      case 3: // Silver Suppliers
        filteredSuppliers = getSuppliersByTier(SupplierTier.SILVER);
        break;
      case 4: // Bronze Suppliers
        filteredSuppliers = getSuppliersByTier(SupplierTier.BRONZE);
        break;
      default:
        filteredSuppliers = getSuppliers();
    }

    setSuppliers(filteredSuppliers);
    setLoading(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedSupplier(null);
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Supplier Management
          </Typography>
          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            Manage suppliers, view performance metrics, and analyze supplier tiers
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DashboardIcon />}
          onClick={() => setViewMode(viewMode === 'list' ? 'dashboard' : 'list')}
        >
          {viewMode === 'list' ? 'View Dashboard' : 'View Suppliers'}
        </Button>
      </Box>

      {viewMode === 'dashboard' ? (
        <Paper elevation={3}>
          <SupplierDashboard />
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', mt: 3 }}>
          <Box sx={{ width: selectedSupplier ? '40%' : '100%', transition: 'width 0.3s' }}>
            <Paper elevation={3}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="supplier tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="All Suppliers" {...a11yProps(0)} />
                  <Tab 
                    label="Platinum" 
                    {...a11yProps(1)} 
                    sx={{ color: '#8892b0' }}
                  />
                  <Tab 
                    label="Gold" 
                    {...a11yProps(2)} 
                    sx={{ color: '#ffd700' }}
                  />
                  <Tab 
                    label="Silver" 
                    {...a11yProps(3)} 
                    sx={{ color: '#c0c0c0' }}
                  />
                  <Tab 
                    label="Bronze" 
                    {...a11yProps(4)} 
                    sx={{ color: '#cd7f32' }}
                  />
                </Tabs>
              </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={tabValue} index={0}>
                  <SuppliersList 
                    suppliers={suppliers} 
                    onSelectSupplier={handleSupplierSelect}
                    selectedSupplierId={selectedSupplier?.id}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <SuppliersList 
                    suppliers={suppliers} 
                    onSelectSupplier={handleSupplierSelect}
                    selectedSupplierId={selectedSupplier?.id}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <SuppliersList 
                    suppliers={suppliers} 
                    onSelectSupplier={handleSupplierSelect}
                    selectedSupplierId={selectedSupplier?.id}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                  <SuppliersList 
                    suppliers={suppliers} 
                    onSelectSupplier={handleSupplierSelect}
                    selectedSupplierId={selectedSupplier?.id}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                  <SuppliersList 
                    suppliers={suppliers} 
                    onSelectSupplier={handleSupplierSelect}
                    selectedSupplierId={selectedSupplier?.id}
                  />
                </TabPanel>
              </>
            )}
            </Paper>
          </Box>

          {selectedSupplier && (
            <Box sx={{ width: '60%', pl: 2 }}>
              <Paper elevation={3} sx={{ height: '100%' }}>
                <SupplierDetails 
                  supplier={selectedSupplier} 
                  onClose={() => setSelectedSupplier(null)}
                  onUpdate={() => loadSuppliers()}
                />
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default SupplierManagement;
