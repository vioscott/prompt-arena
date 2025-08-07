module.exports = {
  extends: ['react-app'],
  rules: {
    // Disable warnings that cause build failures
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        // Allow unused variables in development
        'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      },
    },
  ],
};
