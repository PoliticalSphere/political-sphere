// Unit tests for UserService
// Tests business logic in isolation from external dependencies

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { UserService } from '../../src/domain/user-service.js';
import { getDatabase, closeDatabase } from '../../src/stores/index.js';

describe('UserService Unit Tests', () => {
  let db;
  let userService;

  beforeEach(() => {
    db = getDatabase();
    userService = new UserService(db.users);
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const user = await userService.createUser(userData);

      assert(user.id, 'User should have an ID');
      assert.strictEqual(user.username, userData.username);
      assert.strictEqual(user.email, userData.email);
      assert(user.createdAt, 'User should have createdAt timestamp');
      assert(user.updatedAt, 'User should have updatedAt timestamp');
    });

    it('should throw error for duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'test1@example.com',
      };

      // Create first user
      await userService.createUser(userData);

      // Try to create duplicate
      await assert.rejects(
        async () => await userService.createUser(userData),
        /Username already exists/,
        'Should reject duplicate username'
      );
    });

    it('should throw error for duplicate email', async () => {
      const userData1 = {
        username: 'user1',
        email: 'duplicate@example.com',
      };
      const userData2 = {
        username: 'user2',
        email: 'duplicate@example.com',
      };

      // Create first user
      await userService.createUser(userData1);

      // Try to create with duplicate email
      await assert.rejects(
        async () => await userService.createUser(userData2),
        /Email already exists/,
        'Should reject duplicate email'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userData = {
        username: 'getbyiduser',
        email: 'getbyid@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const retrievedUser = await userService.getUserById(createdUser.id);

      assert.strictEqual(retrievedUser.id, createdUser.id);
      assert.strictEqual(retrievedUser.username, userData.username);
      assert.strictEqual(retrievedUser.email, userData.email);
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');
      assert.strictEqual(user, null);
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      const userData = {
        username: 'getbyusername',
        email: 'getbyusername@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const retrievedUser = await userService.getUserByUsername(userData.username);

      assert.strictEqual(retrievedUser.id, createdUser.id);
      assert.strictEqual(retrievedUser.username, userData.username);
    });

    it('should return null for non-existent username', async () => {
      const user = await userService.getUserByUsername('non-existent-username');
      assert.strictEqual(user, null);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const userData = {
        username: 'getbyemailuser',
        email: 'getbyemail@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const retrievedUser = await userService.getUserByEmail(userData.email);

      assert.strictEqual(retrievedUser.id, createdUser.id);
      assert.strictEqual(retrievedUser.email, userData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await userService.getUserByEmail('non-existent@example.com');
      assert.strictEqual(user, null);
    });
  });
});
