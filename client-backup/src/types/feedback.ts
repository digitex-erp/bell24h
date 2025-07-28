export interface Feedback {
  id: string;
  timestamp: string;
  rating: number;
  comment: string;
  category?: string;
}

export interface FeedbackResponse {
  items: Feedback[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FeedbackSubmitResponse {
  success: boolean;
  message: string;
} 