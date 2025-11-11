// Express CSRF protection middleware setup
// Uses modern 'csrf' package (csurf is deprecated)
// See: https://www.npmjs.com/package/csrf
import { doubleCsrf } from 'csrf-csrf';

// Configure CSRF protection using double-submit cookie pattern
const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('CSRF_SECRET must be set and at least 32 characters long');
    }
    return secret;
  },
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: req => req.headers['x-csrf-token'],
});

// Middleware to generate and attach CSRF token to response
const csrfTokenMiddleware = (req, res, next) => {
  const token = generateToken(req, res);
  res.locals.csrfToken = token;
  // Expose token in response header for SPA consumption
  res.setHeader('X-CSRF-Token', token);
  next();
};

export { doubleCsrfProtection as csrfProtection, csrfTokenMiddleware, invalidCsrfTokenError };
