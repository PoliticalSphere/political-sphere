import { describe, expect, test } from 'vitest';

import { NewsService } from '../../src/news-service.js';

/**
 * Simple in-memory store for testing (matches the pattern from news-service.spec.js)
 */
class MemoryNewsStore {
  constructor(initialItems = []) {
    this._items = initialItems.map(item => ({ ...item }));
  }

  async readAll() {
    return this._items.map(item => ({ ...item }));
  }

  async writeAll(items) {
    this._items = items.map(item => ({ ...item }));
  }

  setItems(items) {
    this._items = items.map(item => ({ ...item }));
  }
}

async function setupStore(initialData = []) {
  const store = new MemoryNewsStore(initialData);
  const service = new NewsService(store, () => new Date('2024-03-01T12:00:00.000Z'));
  return { service, store };
}

describe('NewsService', () => {
  describe('create()', () => {
    test('creates a record and returns it from list()', async () => {
      const { service } = await setupStore();

      const created = await service.create({
        title: 'Parliament Announces Coalition Agreement',
        excerpt: 'Coalition partners outline priorities for the next legislative cycle.',
        content:
          'The agreement introduces major reforms on climate policy and electoral transparency.',
        category: 'governance',
        tags: ['coalition', 'transparency'],
        sources: ['https://example.org/news/coalition'],
      });

      expect(created.id).toBeTruthy();
      expect(created.category).toBe('governance');
      expect(created.tags).toHaveLength(2);
      expect(created.createdAt).toBe('2024-03-01T12:00:00.000Z');

      const list = await service.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(created.id);
    });

    test('filters records by category, tag, limit and search', async () => {
      const seed = [
        {
          id: 'democracy-watch',
          title: 'Democracy Watch Report',
          excerpt: 'Annual report on democratic health',
          content: 'Full report content',
          category: 'governance',
          tags: ['democracy'],
          sources: ['https://example.org/democracy'],
          status: 'published',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'campaign-finance',
          title: 'Campaign Finance Reform',
          excerpt: 'New donation limits announced',
          content: 'Details about donation reform',
          category: 'finance',
          tags: ['transparency'],
          sources: ['https://example.org/finance'],
          status: 'published',
          createdAt: '2024-02-01T00:00:00.000Z',
          updatedAt: '2024-02-01T00:00:00.000Z',
        },
      ];
      const { service } = await setupStore(seed);

      const governance = await service.list({ category: 'governance' });
      expect(governance).toHaveLength(1);
      expect(governance[0].id).toBe('democracy-watch');

      const byTag = await service.list({ tag: 'transparency' });
      expect(byTag).toHaveLength(1);
      expect(byTag[0].id).toBe('campaign-finance');

      const search = await service.list({ search: 'donation' });
      expect(search).toHaveLength(1);
      expect(search[0].id).toBe('campaign-finance');

      const limit = await service.list({ limit: 1 });
      expect(limit).toHaveLength(1);
    });

    test('update returns updated record when found', async () => {
      const seed = [
        {
          id: 'test-1',
          title: 'Original Title',
          excerpt: 'Original excerpt',
          content: 'Original content',
          category: 'politics',
          tags: [],
          sources: [],
          status: 'draft',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const { service } = await setupStore(seed);
      const result = await service.update('test-1', { title: 'Updated Title' });
      expect(result).toBeTruthy();
      expect(result.title).toBe('Updated Title');
    });

    test('analytics summary aggregates categories correctly', async () => {
      const seed = [
        {
          id: 'democracy-watch',
          title: 'Democracy Watch Report',
          excerpt: 'Annual report',
          content: 'Full report',
          category: 'governance',
          tags: [],
          sources: [],
          status: 'published',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'campaign-finance',
          title: 'Campaign Finance',
          excerpt: 'Donation limits',
          content: 'Details',
          category: 'finance',
          tags: [],
          sources: [],
          status: 'published',
          createdAt: '2024-02-01T00:00:00.000Z',
          updatedAt: '2024-02-01T00:00:00.000Z',
        },
      ];
      const { service } = await setupStore(seed);

      const summary = await service.analyticsSummary();
      expect(summary.total).toBe(2);
      expect(summary.categories).toEqual({ governance: 1, finance: 1 });
      expect(summary.recent.length).toBeGreaterThan(0);
      expect(summary.recent[0].id).toBe('campaign-finance');
    });

    test('create throws validation errors when required fields missing', async () => {
      const { service } = await setupStore();

      // Empty title should throw validation error
      await expect(
        service.create({
          title: '',
          excerpt: 'Need a title',
          content: 'Need a title',
        })
      ).rejects.toThrow(/Title|Category/);
    });
  });
});
