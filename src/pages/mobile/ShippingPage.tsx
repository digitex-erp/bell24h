import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import { ShippingForm } from '../../components/mobile/ShippingForm';
import { ShippingOptions } from '../../components/mobile/ShippingOptions';
import { TrackingDisplay } from '../../components/mobile/TrackingDisplay';
import { LogisticsService } from '../../services/logistics/LogisticsService';
import { Location, PackageInfo, ShippingPriorities, ShippingRecommendation } from '../../services/logistics/ShippingOptimizer';
import { TrackingInfo } from '../../services/logistics/TrackingService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`shipping-tabpanel-${index}`}
    aria-labelledby={`shipping-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

export const ShippingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingRecommendation[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingRecommendation | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

  const logisticsService = new LogisticsService();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShippingSubmit = async (
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo,
    priorities: ShippingPriorities
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const options = await logisticsService.getShippingRecommendation(
        origin,
        destination,
        packageDetails,
        priorities
      );
      setShippingOptions([options]);
      setActiveTab(1); // Switch to shipping options tab
    } catch (err) {
      setError('Failed to get shipping options. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option: ShippingRecommendation) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedOption(option);
      // Simulate tracking info for the selected option
      const mockTrackingInfo: TrackingInfo = {
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9),
        carrier: option.carrier,
        status: 'In Transit',
        lastUpdate: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: {
          city: 'New York',
          country: 'USA'
        },
        events: [
          {
            timestamp: new Date(),
            status: 'In Transit',
            location: 'New York',
            description: 'Package picked up by carrier'
          }
        ]
      };
      setTrackingInfo(mockTrackingInfo);
      setActiveTab(2); // Switch to tracking tab
    } catch (err) {
      setError('Failed to process shipping option. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Shipping
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
        >
          <Tab label="New Shipment" />
          <Tab label="Shipping Options" disabled={!shippingOptions.length} />
          <Tab label="Tracking" disabled={!trackingInfo} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ShippingForm onSubmit={handleShippingSubmit} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ShippingOptions
          options={shippingOptions}
          onSelect={handleOptionSelect}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {trackingInfo && (
          <TrackingDisplay
            trackingInfo={trackingInfo}
            isLoading={isLoading}
          />
        )}
      </TabPanel>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 