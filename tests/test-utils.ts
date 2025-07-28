import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { hash } from 'bcryptjs';

type MockUserOptions = {
  withHashedPassword?: boolean;
  email?: string;
  name?: string;
};

export const createMockUser = async (options: MockUserOptions = {}): Promise<Partial<User>> => {
  const { 
    withHashedPassword = false, 
    email = faker.internet.email(),
    name = faker.person.fullName()
  } = options;

  const password = faker.internet.password();
  
  const user = {
    id: faker.string.uuid(),
    email,
    name,
    password: withHashedPassword ? await hash(password, 10) : password,
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return user;
};

export const mockJwt = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return { userId: '1', email: 'test@example.com' };
    }
    throw new Error('Invalid token');
  }),
};

export const mockMailer = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
};

export const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
};

// Mock Prisma client for testing
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  // Add other models as needed
  $disconnect: jest.fn(),
};

// Reset all mocks
export const resetMocks = () => {
  mockJwt.sign.mockClear();
  mockJwt.verify.mockClear();
  mockMailer.sendVerificationEmail.mockClear();
  mockMailer.sendPasswordResetEmail.mockClear();
  
  Object.values(mockPrisma).forEach(mock => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach(fn => {
        if (jest.isMockFunction(fn)) {
          fn.mockClear();
        }
      });
    } else if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  cookies: {},
  user: null,
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();
