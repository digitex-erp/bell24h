import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  FormControl, 
  FormHelperText, 
  Rating, 
  Stack, 
  Chip,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  ThumbUp as ThumbUpIcon, 
  ThumbDown as ThumbDownIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface FeedbackPanelProps {
  explanationId: string;
  modelType?: string;
  onFeedbackSubmitted?: (feedback: {
    explanationId: string;
    rating: number;
    categories: string[];
    comment: string;
    modelType?: string;
  }) => void;
  onClose?: () => void;
}

const FEEDBACK_CATEGORIES = [
  'Incorrect explanation',
  'Missing features',
  'Hard to understand',
  'Technical issues',
  'Performance',
  'Other'
];

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  explanationId,
  modelType,
  onFeedbackSubmitted,
  onClose
}) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === null && !comment.trim() && categories.length === 0) {
      setError('Please provide a rating, select categories, or add a comment.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const feedbackData = {
        explanationId,
        rating: rating || 0,
        categories,
        comment: comment.trim(),
        modelType,
        timestamp: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, make an API call here
      // const response = await fetch('/api/explainability/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // });
      // if (!response.ok) throw new Error('Failed to submit feedback');
      
      setSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted(feedbackData);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box textAlign="center" p={3}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" gutterBottom>Thank You!</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Your feedback has been submitted successfully.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ mt: 2 }}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Provide Feedback</Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {modelType && (
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Model: {modelType}
        </Typography>
      )}

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          How helpful was this explanation?
          <Tooltip 
            title="Rate how well this explanation helped you understand the model's prediction"
            placement="top"
            arrow
          >
            <IconButton size="small" sx={{ ml: 0.5, verticalAlign: 'middle' }}>
              <InfoIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            precision={0.5}
            size="large"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {rating ? `${rating} ${rating === 1 ? 'star' : 'stars'}` : 'Rate this explanation'}
          </Typography>
        </Box>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          What was the issue?
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (Select all that apply)
          </Typography>
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} mb={1}>
          {FEEDBACK_CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              clickable
              color={categories.includes(category) ? 'primary' : 'default'}
              variant={categories.includes(category) ? 'filled' : 'outlined'}
              onClick={() => handleCategoryToggle(category)}
              size="small"
            />
          ))}
        </Stack>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          Additional comments
          <Typography variant="caption" color="text.secondary"> (optional)</Typography>
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please provide more details about your feedback..."
          variant="outlined"
          margin="dense"
        />
        <FormHelperText>
          Your feedback helps us improve the AI explanations.
        </FormHelperText>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1}>
        {onClose && (
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || (rating === null && !comment.trim() && categories.length === 0)}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackPanel;
