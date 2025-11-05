const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const express = require('express');

// Mock the shared module
vi.mock('@political-sphere/shared', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  security: {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

// Mock the database
vi.mock('../../index', () => ({
  getDatabase: vi.fn(() => ({
    users: {
      create: vi.fn(),
      getByUsername: vi.fn(),
      getById: vi.fn(),
    },
  })),
}));

const authRoutes = require('../../routes/auth');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const { getDatabase } = require('../../index');
      const mockDb = getDatabase();
      const { security } = require('@political-sphere/shared');

      mockDb.users.create.mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      });
      security.hashPassword.mockResolvedValue('hashed-password');
      security.generateToken.mockResolvedValue('jwt-token');

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('id', 'user-123');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: '',
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 409 for duplicate username', async () => {
      const { getDatabase } = require('../../index');
      const mockDb = getDatabase();
      mockDb.users.create.mockRejectedValue(new Error('UNIQUE constraint failed: users.username'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const { getDatabase } = require('../../index');
      const mockDb = getDatabase();
      const { security } = require('@political-sphere/shared');

      mockDb.users.getByUsername.mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      security.verifyPassword.mockResolvedValue(true);
      security.generateToken.mockResolvedValue('jwt-token');

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
      const { getDatabase } = require('../../index');
      const mockDb = getDatabase();
      mockDb.users.getByUsername.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      const { getDatabase } = require('../../index');
      const mockDb = getDatabase();
      const { security } = require('@political-sphere/shared');

      mockDb.users.getByUsername.mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hashed-password',
      });
      security.verifyPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
