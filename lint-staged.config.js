// lint-staged.config.js
// Runs linting and formatting on staged files before commit
// Owner: Platform Engineering
// Last updated: 2025-10-29

export default {
  // JavaScript/TypeScript: ESLint for linting, Prettier for formatting
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  
  // JSON, Markdown, YAML: Prettier for formatting
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
