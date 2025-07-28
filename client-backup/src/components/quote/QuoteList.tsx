import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { quoteService } from '../../services/quote/QuoteService';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

interface QuoteResponse {
  items: Quote[];
  total: number;
  page: number;
  pageSize: number;
}

export const QuoteList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quoteService.getQuotes();
      setQuotes(response.items);
    } catch (err) {
      setError('Error loading quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (quotes.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No quotes available
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quotes
        </Typography>

        <List>
          {quotes.map((quote) => (
            <ListItem key={quote.id} divider>
              <ListItemText
                primary={quote.text}
                secondary={`- ${quote.author}`}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={fetchQuotes}
            startIcon={<CircularProgress size={20} />}
          >
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 