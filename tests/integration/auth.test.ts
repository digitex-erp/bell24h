import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { hash } from 'bcryptjs';

// Mock the Prisma client
jest.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $disconnect: jest.fn(),
    },
  };
});

describe('Auth API', () => {
  // Test user data
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock Prisma to return null for findUnique (user doesn't exist)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock successful user creation
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: testUser.email,
        name: testUser.name,
        password: await hash(testUser.password, 10),
        emailVerified: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if user already exists', async () => {
      // Mock Prisma to return a user (user already exists)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: testUser.email,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Mock Prisma to return a user with hashed password
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: testUser.email,
        name: testUser.name,
        password: await hash(testUser.password, 10),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid credentials', async () => {
      // Mock Prisma to return a user with different password
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: testUser.email,
        name: testUser.name,
        password: await hash('wrongpassword', 10),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password, // This won't match the hashed password
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      // Mock Prisma to return a user
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: testUser.email,
        name: testUser.name,
      });

      // First, login to get a token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.token;

      // Use the token to get current user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should return 401 without valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
