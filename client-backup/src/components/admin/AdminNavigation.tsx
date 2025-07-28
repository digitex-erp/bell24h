'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Monitor as MonitorIcon,
  Refresh as RefreshIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon,
  Report as ReportIcon,
} from '@mui/icons-material';

interface AdminNavigationProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number;
}

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavigationItem[];
}

const DRAWER_WIDTH = 280;

export default function AdminNavigation({ 
  open, 
  onClose, 
  variant = 'persistent',
  width = DRAWER_WIDTH 
}: AdminNavigationProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Navigation items with badges for pending items
  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <DashboardIcon />,
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <PeopleIcon />,
      badge: 5, // Mock pending approvals
    },
    {
      title: 'Analytics',
      path: '/admin/analytics',
      icon: <AnalyticsIcon />,
    },
    {
      title: 'System Monitoring',
      path: '/admin/monitoring',
      icon: <MonitorIcon />,
    },
    {
      title: 'RFQ Management',
      path: '/admin/rfqs',
      icon: <AssessmentIcon />,
      badge: 12, // Mock pending RFQs
    },
    {
      title: 'Security Settings',
      path: '/admin/security',
      icon: <SecurityIcon />,
    },
    {
      title: 'Notifications',
      path: '/admin/notifications',
      icon: <NotificationsIcon />,
      badge: 3, // Mock unread notifications
    },
    {
      title: 'Reports',
      path: '/admin/reports',
      icon: <ReportIcon />,
      children: [
        {
          title: 'User Reports',
          path: '/admin/reports/users',
          icon: <PeopleIcon />,
        },
        {
          title: 'Transaction Reports',
          path: '/admin/reports/transactions',
          icon: <TrendingUpIcon />,
        },
        {
          title: 'Performance Reports',
          path: '/admin/reports/performance',
          icon: <AnalyticsIcon />,
        },
      ],
    },
    {
      title: 'Business Intelligence',
      path: '/admin/business-intelligence',
      icon: <BusinessIcon />,
      children: [
        {
          title: 'Market Analysis',
          path: '/admin/business-intelligence/market',
          icon: <TrendingUpIcon />,
        },
        {
          title: 'Competitor Analysis',
          path: '/admin/business-intelligence/competitors',
          icon: <FlagIcon />,
        },
        {
          title: 'Revenue Analytics',
          path: '/admin/business-intelligence/revenue',
          icon: <AnalyticsIcon />,
        },
      ],
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleExpandItem = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const isExpanded = (title: string) => {
    return expandedItems.includes(title);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const expanded = isExpanded(item.title);

    return (
      <Box key={item.path}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleExpandItem(item.title);
              } else {
                handleNavigation(item.path);
              }
            }}
            selected={active}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: active ? 'primary.contrastText' : 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
              }}
            />
            {item.badge && (
              <Badge 
                badgeContent={item.badge} 
                color="error"
                sx={{ mr: 1 }}
              />
            )}
            {hasChildren && (
              expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Admin Panel
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.name || 'Administrator'}
          </Typography>
        </Box>
        {variant === 'temporary' && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Bell24H Admin
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton size="small" onClick={() => window.location.reload()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {variant === 'temporary' && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1201,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'background.paper',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        sx={{
          width: width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
} 