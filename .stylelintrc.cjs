/* eslint-env node */
module.exports = {
    extends: [
        'stylelint-config-htmlacademy'
    ],
    rules: {
        'function-no-unknown': [
            true,
            {
                ignoreFunctions: ['size']
            }
        ],
    },
}
