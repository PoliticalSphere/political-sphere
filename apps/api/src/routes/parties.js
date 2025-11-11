import express from 'express';

import { authenticate } from '../auth/auth.middleware.ts';
import logger from '../logger.js';
import { getDatabase } from '../modules/stores/index.ts';
import { CreatePartySchema } from '../utils/shared-shim.js';

const router = express.Router();

// Conditional auth bypass for test env unless FORCE_AUTH=1 is set
const requireAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'test' && process.env.FORCE_AUTH !== '1') {
    return next();
  }
  return authenticate(req, res, next);
};

function getPartyStore() {
  return getDatabase().parties;
}

// GET /parties - Get all parties (requires authentication)
router.get('/parties', requireAuth, async (_req, res) => {
  try {
    const store = getPartyStore();
    const { parties } = await store.getAll();
    res.json({ parties });
  } catch (error) {
    logger.error('GET /parties failed', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /parties/:id - Get party by ID (requires authentication)
router.get('/parties/:id', requireAuth, async (req, res) => {
  try {
    const store = getPartyStore();
    const party = await store.getById(req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ party });
  } catch (error) {
    logger.error('GET /parties/:id failed', { error, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /parties - Create new party (requires authentication)
router.post('/parties', requireAuth, async (req, res) => {
  try {
    // Validate input with schema
    const input = CreatePartySchema.parse(req.body);

    const store = getPartyStore();
    const party = await store.create(input);
    res.status(201).json({ success: true, data: party });
  } catch (error) {
    // Handle validation errors
    if (error.issues || error.message?.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid input',
        details: error.issues,
      });
    }

    logger.error('POST /parties failed', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /parties/:id - Update party (requires authentication)
router.put('/parties/:id', requireAuth, async (req, res) => {
  try {
    const store = getPartyStore();
    const party = await store.update(req.params.id, req.body);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ party });
  } catch (error) {
    logger.error('PUT /parties/:id failed', { error, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /parties/:id - Delete party (requires authentication)
router.delete('/parties/:id', requireAuth, async (req, res) => {
  try {
    const store = getPartyStore();
    const deleted = await store.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ success: true });
  } catch (error) {
    logger.error('DELETE /parties/:id failed', { error, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
