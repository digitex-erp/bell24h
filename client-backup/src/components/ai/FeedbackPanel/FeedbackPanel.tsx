import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Rating,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { feedbackService } from '../../../services/feedback/FeedbackService';

interface FeedbackForm {
  rating: number;
  comment: string;
}

export const FeedbackPanel: React.FC = () => {
  const [form, setForm] = useState<FeedbackForm>({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRatingChange = (_: React.SyntheticEvent, value: number | null) => {
    setForm(prev => ({ ...prev, rating: value || 0 }));
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, comment: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await feedbackService.submitFeedback(form);
      setSuccess(response.message);
      setForm({ rating: 0, comment: '' });
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          How was your experience?
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Rating
            value={form.rating}
            onChange={handleRatingChange}
            precision={1}
            size="large"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            value={form.comment}
            onChange={handleCommentChange}
            placeholder="Tell us more about your experience..."
            margin="normal"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!form.rating || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};