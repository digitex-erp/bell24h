import React, { useState } from 'react';
import { Snackbar, Alert, Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function NotificationToast() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(2); // Example unread count
  const [message, setMessage] = useState('You have 2 new notifications!');

  // TODO: Replace with real notification logic

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} size="large">
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setOpen(false)} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
