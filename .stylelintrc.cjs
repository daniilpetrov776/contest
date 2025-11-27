/* eslint-env node */
module.exports = {
    extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-recess-order',
    ],
    rules: {
        'at-rule-no-unknown': null,
        'media-query-no-invalid': null,
        'selector-class-pattern': null,
        'scss/dollar-variable-pattern': null,
        'scss/at-mixin-pattern': null,
        'no-invalid-position-at-import-rule': null,
        'no-descending-specificity': null,
        'declaration-property-value-no-unknown': null,
    },
    ignoreFiles: ['scss/libs/gallery/**/*.scss'],
}
