import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { PartyService } from '../../src/domain/party-service';
import { getDatabase, closeDatabase } from '../../src/stores';

describe('PartyService', () => {
  beforeEach(() => {
    getDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('createParty', () => {
    it('should create a new party', async () => {
      const service = new PartyService();
      const input = {
        name: 'Test Party',
        description: 'A test party',
        color: '#FF0000',
      };

      const party = await service.createParty(input);

      assert.strictEqual(party.name, input.name);
      assert.strictEqual(party.description, input.description);
      assert.strictEqual(party.color, input.color);
      assert(party.id);
      assert(party.createdAt instanceof Date);
    });

    it('should throw error for duplicate party name', async () => {
      const service = new PartyService();
      const input = {
        name: 'Test Party',
        description: 'A test party',
        color: '#FF0000',
      };

      await service.createParty(input);

      await assert.rejects(
        async () => await service.createParty(input),
        /Party name already exists/
      );
    });
  });

  describe('getPartyById', () => {
    it('should return party by id', async () => {
      const service = new PartyService();
      const input = {
        name: 'Test Party',
        description: 'A test party',
        color: '#FF0000',
      };

      const created = await service.createParty(input);
      const retrieved = await service.getPartyById(created.id);

      assert.deepStrictEqual(retrieved, created);
    });

    it('should return null for non-existent party', async () => {
      const service = new PartyService();
      const party = await service.getPartyById('non-existent-id');
      assert.strictEqual(party, null);
    });
  });

  describe('getAllParties', () => {
    it('should return all parties', async () => {
      const service = new PartyService();

      const input1 = {
        name: 'Party 1',
        description: 'First party',
        color: '#FF0000',
      };
      const input2 = {
        name: 'Party 2',
        description: 'Second party',
        color: '#00FF00',
      };

      const party1 = await service.createParty(input1);
      const party2 = await service.createParty(input2);

      const parties = await service.getAllParties();

      assert(parties.length >= 2);
      assert(parties.some((p) => p.id === party1.id));
      assert(parties.some((p) => p.id === party2.id));
    });
  });
});
