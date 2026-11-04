module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['import'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    /* js/ts 通用 */
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'max-lines': ['error', { max: 1000 }], // 单个文件最大1000行
    'max-lines-per-function': ['error', { max: 80 }], // 单个函数最大80行
    'no-multi-assign': 'error', // 不允许连续赋值
    'no-new-wrappers': 'error', // 对于String, Number, and Boolean不能使用new
    'array-callback-return': 'error', // 除了forEach，数组函数必须有返回值
    complexity: ['error', 15], // 圈复杂度，不能超过15，超过了的代码的理解成本非常高
    'max-params': 'error', // 函数参数数量，默认最多3个
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }], //不允许使用++/--，但在for循环中允许
    eqeqeq: 'error', // 禁止使用!=和==，要使用===和!==
    'no-nested-ternary': 'error', // 禁止使用嵌套三元表达式

    /* ts */
    '@typescript-eslint/no-unused-vars': 'error', // 禁止存在未使用的变量
    '@typescript-eslint/no-explicit-any': 'error', // 非特殊情况禁止使用any
    '@typescript-eslint/no-non-null-assertion': 'off', // 允许使用非空断言

    /* vue */
    'vue/multi-word-component-names': 'off', //组件命名

    /* import相关 */
    'no-duplicate-imports': 'error', // 重复的import写成一行
    'import/first': 'error', //import要在代码的最前面
    'import/no-named-as-default': 'off', //禁止 default import 的名字跟文件内的其他 export 命名相同
    'import/no-self-import': 'error', // 不能引用自身
    'max-lines-per-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
}
