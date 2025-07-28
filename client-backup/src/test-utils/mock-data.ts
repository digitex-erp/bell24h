/**
 * Generates mock data for testing tables and lists
 */

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
};

const NAMES = [
  'John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Davis', 'Michael Brown',
  'Sarah Wilson', 'David Taylor', 'Jennifer Anderson', 'Thomas Moore', 'Lisa Martin'
];

const ROLES = ['Admin', 'Editor', 'Viewer', 'Manager', 'Developer'];

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const STATUSES = ['active', 'inactive', 'pending'] as const;

/**
 * Generates a random date within the last year
 */
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

/**
 * Generates an array of mock users
 */
export const generateMockUsers = (count: number = 10): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    email: `user${i + 1}@example.com`,
    role: ROLES[Math.floor(Math.random() * ROLES.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    lastLogin: randomDate(new Date(2023, 0, 1), new Date()),
  }));
};

/**
 * Generates an array of mock products
 */
export const generateMockProducts = (count: number = 10): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod-${i + 1000}`,
    name: `Product ${i + 1}`,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    price: Math.floor(Math.random() * 1000) + 10,
    stock: Math.floor(Math.random() * 100),
    rating: Number((Math.random() * 5).toFixed(1)),
  }));
};

/**
 * Mocks a successful API response
 */
export const mockSuccessResponse = <T>(data: T, delay: number = 300) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => resolve({ data }), delay);
  });
};

/**
 * Mocks a failed API response
 */
export const mockErrorResponse = (error: string = 'An error occurred', status: number = 500, delay: number = 300) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      const errorObj = new Error(error) as any;
      errorObj.response = { status, data: { message: error } };
      reject(errorObj);
    }, delay);
  });
};
