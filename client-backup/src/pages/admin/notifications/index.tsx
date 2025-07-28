import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  metadata: Record<string, any>;
  channels: string[];
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
}

const NotificationDashboard = () => {
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  const [channel, setChannel] = useState('all');

  const { data: notifications, isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', timeRange, channel],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications?timeRange=${timeRange}&channel=${channel}`,
      );
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notification Center</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="6h">Last 6 Hours</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Channel</InputLabel>
            <Select
              value={channel}
              label="Channel"
              onChange={(e) => setChannel(e.target.value)}
            >
              <MenuItem value="all">All Channels</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="slack">Slack</MenuItem>
              <MenuItem value="discord">Discord</MenuItem>
              <MenuItem value="teams">Teams</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="All" />
            <Tab label="Errors" />
            <Tab label="Warnings" />
            <Tab label="Info" />
          </Tabs>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Channels</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications?.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{format(new Date(notification.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>
                  <Chip
                    label={notification.type}
                    color={getTypeColor(notification.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{notification.title}</TableCell>
                <TableCell>
                  {notification.channels.map((ch) => (
                    <Chip
                      key={ch}
                      label={ch}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip
                    label={notification.status}
                    color={getStatusColor(notification.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NotificationDashboard; 