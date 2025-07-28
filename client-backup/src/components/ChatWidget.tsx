import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Welcome to Bell24H Chat!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'me', text: input }]);
      setInput('');
      // TODO: Send message to backend/socket
    }
  };

  return (
    <Box position="fixed" bottom={16} right={16} zIndex={1300}>
      {!open && (
        <IconButton color="primary" onClick={() => setOpen(true)} size="large">
          <ChatIcon fontSize="large" />
        </IconButton>
      )}
      {open && (
        <Paper sx={{ width: 320, height: 400, display: 'flex', flexDirection: 'column' }} elevation={6}>
          <Box p={2} bgcolor="primary.main" color="#fff" display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Chat</Typography>
            <Button color="inherit" size="small" onClick={() => setOpen(false)}>Close</Button>
          </Box>
          <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
            {messages.map((msg, i) => (
              <ListItem key={i} sx={{ justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <ListItemText primary={msg.text} sx={{ textAlign: msg.from === 'me' ? 'right' : 'left' }} />
              </ListItem>
            ))}
          </List>
          <Box p={2} display="flex" gap={1}>
            <TextField
              value={input}
              onChange={e => setInput(e.target.value)}
              size="small"
              placeholder="Type a message..."
              fullWidth
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <Button variant="contained" onClick={handleSend}>Send</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
