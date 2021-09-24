module.exports = {
    extends: 'standard-with-typescript',
    parserOptions: {
        project: './tsconfig.json',
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

        '@typescript-eslint/ban-ts-comment': 'warn',
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
