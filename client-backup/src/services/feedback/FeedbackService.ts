import { Feedback, FeedbackResponse } from '../../types/feedback';

export const feedbackService = {
  submitFeedback: jest.fn().mockResolvedValue({
    success: true,
    message: 'Feedback submitted successfully'
  }),

  getFeedback: jest.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00Z',
        rating: 5,
        comment: 'Great service!',
        category: 'general'
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  } as FeedbackResponse),

  getFeedbackById: jest.fn().mockResolvedValue({
    id: '1',
    timestamp: '2024-01-01T00:00:00Z',
    rating: 5,
    comment: 'Great service!',
    category: 'general'
  } as Feedback)
}; 