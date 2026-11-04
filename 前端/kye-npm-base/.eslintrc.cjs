module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // 添加 TypeScript 推荐规则
    'plugin:prettier/recommended', // 启用 Prettier
  ],
  parser: '@typescript-eslint/parser', // 确保使用 TypeScript 解析器
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-async-promise-executor': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-async-promise-executor': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // 仅对 TypeScript 文件应用解析器
      parser: '@typescript-eslint/parser',
    },
  ],
}
