import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/material';
import { TrackingInfo } from '../../services/logistics/TrackingService';

interface TrackingDisplayProps {
  trackingInfo: TrackingInfo;
  isLoading?: boolean;
}

export const TrackingDisplay: React.FC<TrackingDisplayProps> = ({
  trackingInfo,
  isLoading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'in transit':
        return 'primary';
      case 'exception':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Tracking Information
                </Typography>
                <Chip
                  label={trackingInfo.status}
                  color={getStatusColor(trackingInfo.status)}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Tracking Number
              </Typography>
              <Typography variant="body1">
                {trackingInfo.trackingNumber}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Carrier
              </Typography>
              <Typography variant="body1">
                {trackingInfo.carrier}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Location
              </Typography>
              <Typography variant="body1">
                {trackingInfo.location.city}, {trackingInfo.location.country}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Estimated Delivery
              </Typography>
              <Typography variant="body1">
                {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Tracking History
              </Typography>
              <Timeline>
                {trackingInfo.events.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot color={getStatusColor(event.status)} />
                      {index < trackingInfo.events.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        {event.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 