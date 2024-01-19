module.exports = {
    root: true,
    env: {browser: true, es2020: true},
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'google'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', {allowConstantExport: true},],
        'max-len': ["error", {
            code: 120, tabWidth: 2,
        }],
        'require-jsdoc': 0,
        'object-curly-spacing': ["error", "always"]
    },
}
