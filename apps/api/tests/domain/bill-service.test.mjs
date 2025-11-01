import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { BillService } from '../../src/domain/bill-service';
import { UserService } from '../../src/domain/user-service';
import { getDatabase, closeDatabase } from '../../src/stores';

describe('BillService', () => {
  let userService;
  let billService;

  beforeEach(() => {
    getDatabase();
    userService = new UserService();
    billService = new BillService();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('proposeBill', () => {
    it('should create a new bill', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const input = {
        title: 'Test Bill',
        description: 'A test bill description',
        proposerId: user.id,
      };

      const bill = await billService.proposeBill(input);

      assert.strictEqual(bill.title, input.title);
      assert.strictEqual(bill.description, input.description);
      assert.strictEqual(bill.proposerId, input.proposerId);
      assert.strictEqual(bill.status, 'proposed');
      assert(bill.id);
      assert(bill.createdAt instanceof Date);
      assert(bill.updatedAt instanceof Date);
    });

    it('should throw error for non-existent proposer', async () => {
      const input = {
        title: 'Test Bill',
        description: 'A test bill description',
        proposerId: 'non-existent-id',
      };

      await assert.rejects(
        async () => await billService.proposeBill(input),
        /Proposer does not exist/
      );
    });
  });

  describe('getBillById', () => {
    it('should return bill by id', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const input = {
        title: 'Test Bill',
        description: 'A test bill description',
        proposerId: user.id,
      };

      const created = await billService.proposeBill(input);
      const retrieved = await billService.getBillById(created.id);

      assert.deepStrictEqual(retrieved, created);
    });

    it('should return null for non-existent bill', async () => {
      const bill = await billService.getBillById('non-existent-id');
      assert.strictEqual(bill, null);
    });
  });
});
