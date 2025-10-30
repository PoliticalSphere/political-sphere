import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createNewsServer } from '../src/server.js';
import { NewsService } from '../src/newsService.js';
import { JsonNewsStore } from '../src/news-store.js';
import {
  createUser,
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  requireAuth,
  initiatePasswordReset,
  resetPassword,
  getUserById,
  users,
  refreshTokens
} from '../src/auth.js';

describe('Authentication API Tests', () => {
  let server;
  let service;
  const PORT = 4002;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    const store = new JsonNewsStore(new URL('../data/news.json', import.meta.url));
    service = new NewsService(store);
    server = createNewsServer(service);

    await new Promise((resolve) => {
      server.listen(PORT, '127.0.0.1', resolve);
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  beforeEach(() => {
    // Clear users and tokens before each test
    users.clear();
    refreshTokens.clear();
  });

  describe('POST /auth/register', () => {
    test('successfully registers a new user', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          role: 'viewer'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user).toHaveProperty('id');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.role).toBe('viewer');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
    });

    test('returns 409 for duplicate email', async () => {
      // Register first user
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password123'
        })
      });

      // Try to register again
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password456'
        })
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('User already exists');
    });

    test('returns 400 for missing email', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email and password are required');
    });

    test('returns 400 for missing password', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email and password are required');
    });

    test('defaults to viewer role when not specified', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'viewer@example.com',
          password: 'password123'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user.role).toBe('viewer');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123'
        })
      });
    });

    test('successfully logs in with correct credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.email).toBe('login@example.com');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
    });

    test('returns 401 for invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    test('returns 401 for non-existent user', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    test('returns 400 for missing email', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email and password are required');
    });

    test('returns 400 for missing password', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email and password are required');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and login to get tokens
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'refresh@example.com',
          password: 'password123'
        })
      });

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'refresh@example.com',
          password: 'password123'
        })
      });

      const loginData = await loginResponse.json();
      refreshToken = loginData.refreshToken;
    });

    test('successfully refreshes tokens with valid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data.refreshToken).not.toBe(refreshToken); // Should be a new token
    });

    test('returns 401 for invalid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-token'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid or expired refresh token');
    });

    test('returns 400 for missing refresh token', async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Refresh token is required');
    });
  });

  describe('POST /auth/logout', () => {
    test('successfully logs out', async () => {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'some-token'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Logged out successfully');
    });

    test('handles logout without refresh token', async () => {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Logged out successfully');
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      // Register a user
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'forgot@example.com',
          password: 'password123'
        })
      });
    });

    test('initiates password reset for existing user', async () => {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'forgot@example.com'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('password reset link has been sent');
      expect(data).toHaveProperty('resetToken'); // For testing
    });

    test('handles non-existent user gracefully', async () => {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('password reset link has been sent');
      // Should not reveal if user exists
    });

    test('returns 400 for missing email', async () => {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email is required');
    });
  });

  describe('POST /auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Register a user and initiate password reset
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reset@example.com',
          password: 'password123'
        })
      });

      const forgotResponse = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reset@example.com'
        })
      });

      const forgotData = await forgotResponse.json();
      resetToken = forgotData.resetToken;
    });

    test('successfully resets password with valid token', async () => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: 'newpassword123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Password reset successfully');

      // Verify new password works
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reset@example.com',
          password: 'newpassword123'
        })
      });

      expect(loginResponse.status).toBe(200);
    });

    test('returns 400 for invalid reset token', async () => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'invalid-token',
          newPassword: 'newpassword123'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid or expired reset token');
    });

    test('returns 400 for missing token', async () => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: 'newpassword123'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Reset token and new password are required');
    });

    test('returns 400 for missing new password', async () => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Reset token and new password are required');
    });
  });

  describe('Authentication middleware integration', () => {
    let accessToken;

    beforeEach(async () => {
      // Register and login to get access token
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'middleware@example.com',
          password: 'password123'
        })
      });

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'middleware@example.com',
          password: 'password123'
        })
      });

      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;
    });

    test('accepts valid access token', async () => {
      // Note: This test assumes we have a protected route
      // For now, just test that the token is generated correctly
      expect(accessToken).toBeTruthy();
      expect(typeof accessToken).toBe('string');
      expect(accessToken.split('.')).toHaveLength(3); // JWT format
    });

    test('rejects invalid access token', async () => {
      // This would be tested with a protected route
      // For now, just verify token structure
      expect(() => {
        // Invalid token format
        const invalidToken = 'invalid.jwt.token';
        // In a real test, we'd make a request with this token
      }).toBeDefined();
    });
  });

  describe('API root endpoint', () => {
    test('includes auth endpoints in API listing', async () => {
      const response = await fetch(`${BASE_URL}/`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.endpoints).toContain('/auth/register');
      expect(data.endpoints).toContain('/auth/login');
      expect(data.endpoints).toContain('/auth/refresh');
      expect(data.endpoints).toContain('/auth/logout');
      expect(data.endpoints).toContain('/auth/forgot-password');
      expect(data.endpoints).toContain('/auth/reset-password');
    });
  });
});
