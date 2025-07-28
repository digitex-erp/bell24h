'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { usePathname } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import AdminNavigation from './AdminNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [navigationOpen, setNavigationOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Close navigation on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setNavigationOpen(false);
    }
  }, [pathname, isMobile]);

  // Handle responsive behavior
  useEffect(() => {
    setNavigationOpen(!isMobile);
  }, [isMobile]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNavigationToggle = () => {
    setNavigationOpen(!navigationOpen);
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Admin', path: '/admin', icon: <DashboardIcon fontSize="small" /> }
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      if (index === 0) return; // Skip 'admin'
      currentPath += `/${path}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ label, path: currentPath, icon: null });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <AdminNavigation
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleNavigationToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flex: 1 }}>
              {/* Breadcrumbs */}
              <Breadcrumbs
                separator="›"
                sx={{ mb: 0.5 }}
                aria-label="breadcrumb"
              >
                {breadcrumbs.map((breadcrumb, index) => (
                  <Link
                    key={breadcrumb.path}
                    color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                    href={breadcrumb.path}
                    underline="hover"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.875rem',
                    }}
                  >
                    {breadcrumb.icon}
                    {breadcrumb.label}
                  </Link>
                ))}
              </Breadcrumbs>

              {/* Page Title */}
              <Typography variant="h6" component="h1" fontWeight="bold">
                {title || breadcrumbs[breadcrumbs.length - 1]?.label || 'Admin Dashboard'}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <IconButton color="inherit" size="large">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                size="large"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            backgroundColor: 'grey.50',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <AccountCircleIcon sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => window.location.href = '/'}>
          <HomeIcon sx={{ mr: 2 }} />
          Back to Site
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
} 