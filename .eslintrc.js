module.exports = {
    plugins: [
        'react',
    ],
    extends: [
        'standard-with-typescript',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        node: true,
        jest: true
    },
    ignorePatterns: ['dist'],
    rules: {
        'curly': ['error', 'multi-or-nest', 'consistent'],
        'operator-linebreak': ['error', 'after'],

        indent: 'off',
        'space-before-function-paren': 'off',
        'brace-style': 'off',
        'comma-dangle': 'off',

        '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
        '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: false }],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],
        '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true, ignoreVoidOperator: false }],

        '@typescript-eslint/ban-ts-comment': 'off', // was 'warn' which now requires an explainaint per occurrence
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-dynamic-delete': 'warn',
        '@typescript-eslint/consistent-type-assertions': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
    },
}
