export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export interface QuoteResponse {
  items: Quote[];
  total: number;
  page: number;
  pageSize: number;
} 