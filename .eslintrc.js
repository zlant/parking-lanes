module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'standard',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    ignorePatterns: ['dist'],
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'brace-style': ['error', '1tbs', { allowSingleLine: false }],
        'comma-dangle': ['error', 'always-multiline'],
        curly: ['error', 'multi-or-nest', 'consistent'],
        'space-before-function-paren': ['error', 'never'],
        'operator-linebreak': ['error', 'after'],
    },
}
