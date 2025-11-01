import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { UserService } from '../../src/domain/user-service';
import { getDatabase, closeDatabase } from '../../src/stores';

describe('UserService', () => {
  let db;

  beforeEach(() => {
    db = getDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const service = new UserService();
      const input = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const user = await service.createUser(input);

      assert.strictEqual(user.username, input.username);
      assert.strictEqual(user.email, input.email);
      assert(user.id);
      assert(user.createdAt instanceof Date);
      assert(user.updatedAt instanceof Date);
    });

    it('should throw error for duplicate username', async () => {
      const service = new UserService();
      const input = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await service.createUser(input);

      await assert.rejects(
        async () => await service.createUser(input),
        /Username or email already exists/
      );
    });

    it('should throw error for duplicate email', async () => {
      const service = new UserService();
      const input1 = {
        username: 'testuser1',
        email: 'test@example.com',
      };
      const input2 = {
        username: 'testuser2',
        email: 'test@example.com',
      };

      await service.createUser(input1);

      await assert.rejects(
        async () => await service.createUser(input2),
        /Username or email already exists/
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const service = new UserService();
      const input = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const created = await service.createUser(input);
      const retrieved = await service.getUserById(created.id);

      assert.deepStrictEqual(retrieved, created);
    });

    it('should return null for non-existent user', async () => {
      const service = new UserService();
      const user = await service.getUserById('non-existent-id');
      assert.strictEqual(user, null);
    });
  });
});
