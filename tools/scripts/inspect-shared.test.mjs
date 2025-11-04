import { describe, it } from 'vitest';

describe('inspect shared package', () => {
  it('logs shared exports', async () => {
    // Import via the same alias used in the app/tests
    const shared = await import('@political-sphere/shared');
    // Persist top-level keys and a quick typeof check for CreateUserSchema so we can inspect outside the test runner
    try {
      const payload = { keys: Object.keys(shared), createUserSchemaType: typeof shared.CreateUserSchema };
      await import('fs').then(({ writeFileSync }) => writeFileSync('/tmp/political_sphere_shared_exports.json', JSON.stringify(payload, null, 2)));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('failed writing inspect file', String(err));
    }
  });
});
