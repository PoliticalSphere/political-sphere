import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { VoteService } from '../../src/domain/vote-service';
import { UserService } from '../../src/domain/user-service';
import { BillService } from '../../src/domain/bill-service';
import { getDatabase, closeDatabase } from '../../src/stores';

describe('VoteService', () => {
  let userService;
  let billService;
  let voteService;

  beforeEach(() => {
    getDatabase();
    userService = new UserService();
    billService = new BillService();
    voteService = new VoteService();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('castVote', () => {
    it('should create a new vote', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const bill = await billService.proposeBill({
        title: 'Test Bill',
        description: 'A test bill',
        proposerId: user.id,
      });

      const input = {
        billId: bill.id,
        userId: user.id,
        vote: 'aye',
      };

      const vote = await voteService.castVote(input);

      assert.strictEqual(vote.billId, input.billId);
      assert.strictEqual(vote.userId, input.userId);
      assert.strictEqual(vote.vote, input.vote);
      assert(vote.id);
      assert(vote.createdAt instanceof Date);
    });

    it('should throw error for non-existent bill', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const input = {
        billId: 'non-existent-bill',
        userId: user.id,
        vote: 'aye',
      };

      await assert.rejects(async () => await voteService.castVote(input), /Bill does not exist/);
    });

    it('should throw error for non-existent user', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const bill = await billService.proposeBill({
        title: 'Test Bill',
        description: 'A test bill',
        proposerId: user.id,
      });

      const input = {
        billId: bill.id,
        userId: 'non-existent-user',
        vote: 'aye',
      };

      await assert.rejects(async () => await voteService.castVote(input), /User does not exist/);
    });

    it('should throw error for duplicate vote', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const bill = await billService.proposeBill({
        title: 'Test Bill',
        description: 'A test bill',
        proposerId: user.id,
      });

      const input = {
        billId: bill.id,
        userId: user.id,
        vote: 'aye',
      };

      await voteService.castVote(input);

      await assert.rejects(
        async () => await voteService.castVote(input),
        /User has already voted on this bill/
      );
    });
  });

  describe('getBillVotes', () => {
    it('should return votes for a bill', async () => {
      const user1 = await userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
      });

      const user2 = await userService.createUser({
        username: 'user2',
        email: 'user2@example.com',
      });

      const bill = await billService.proposeBill({
        title: 'Test Bill',
        description: 'A test bill',
        proposerId: user1.id,
      });

      const vote1 = await voteService.castVote({
        billId: bill.id,
        userId: user1.id,
        vote: 'aye',
      });

      const vote2 = await voteService.castVote({
        billId: bill.id,
        userId: user2.id,
        vote: 'nay',
      });

      const votes = await voteService.getBillVotes(bill.id);

      assert.strictEqual(votes.length, 2);
      assert(votes.some((v) => v.id === vote1.id));
      assert(votes.some((v) => v.id === vote2.id));
    });
  });

  describe('getVoteCounts', () => {
    it('should return vote counts for a bill', async () => {
      const user1 = await userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
      });

      const user2 = await userService.createUser({
        username: 'user2',
        email: 'user2@example.com',
      });

      const user3 = await userService.createUser({
        username: 'user3',
        email: 'user3@example.com',
      });

      const bill = await billService.proposeBill({
        title: 'Test Bill',
        description: 'A test bill',
        proposerId: user1.id,
      });

      await voteService.castVote({
        billId: bill.id,
        userId: user1.id,
        vote: 'aye',
      });

      await voteService.castVote({
        billId: bill.id,
        userId: user2.id,
        vote: 'aye',
      });

      await voteService.castVote({
        billId: bill.id,
        userId: user3.id,
        vote: 'nay',
      });

      const counts = await voteService.getVoteCounts(bill.id);

      assert.strictEqual(counts.aye, 2);
      assert.strictEqual(counts.nay, 1);
      assert.strictEqual(counts.abstain, 0);
    });
  });
});
