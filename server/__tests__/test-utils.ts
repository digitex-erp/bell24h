import { Request, Response, RequestHandler } from 'express';

type MockResponse = Partial<Response> & {
  status: jest.MockedFunction<Response['status']>;
  json: jest.MockedFunction<Response['json']>;
  send: jest.MockedFunction<Response['send']>;
};

export const createMockRequest = <T = any>(
  overrides: Partial<Request> = {}
): Request => ({
  query: {},
  params: {},
  body: {},
  headers: {},
  ...overrides,
} as unknown as Request<T>);

export const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

export const mockNext: jest.MockedFunction<RequestHandler> = jest.fn();

export interface MockRFQ {
  id: string;
  productName: string;
  status: string;
  buyerName: string;
  productCategory: string;
  price: number;
  assignedUser: string;
  supplierRiskScore: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mockRFQ: MockRFQ = {
  id: 'test-id-123',
  productName: 'Test Product',
  status: 'submitted',
  buyerName: 'Test Buyer',
  productCategory: 'Electronics',
  price: 1000,
  assignedUser: 'user@example.com',
  supplierRiskScore: 75,
  location: 'New York',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

interface MockPrismaClient {
  rFQ: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  $disconnect: jest.Mock;
}

export const mockPrisma: MockPrismaClient = {
  rFQ: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Reset all mocks before each test
export const resetMocks = (): void => {
  jest.clearAllMocks();
  
  // Reset Prisma mocks
  mockPrisma.rFQ.findMany.mockReset().mockResolvedValue([mockRFQ]);
  mockPrisma.rFQ.findUnique.mockReset().mockResolvedValue(mockRFQ);
  mockPrisma.rFQ.create.mockReset().mockResolvedValue(mockRFQ);
  mockPrisma.rFQ.update.mockReset().mockResolvedValue(mockRFQ);
  mockPrisma.rFQ.count.mockReset().mockResolvedValue(1);
  mockPrisma.$disconnect.mockReset();
  mockNext.mockReset();
  mockPrisma.rFQ.update.mockReset().mockResolvedValue(mockRFQ);
  mockPrisma.rFQ.count.mockReset().mockResolvedValue(1);
  mockPrisma.$disconnect.mockReset().mockResolvedValue(undefined);
};
