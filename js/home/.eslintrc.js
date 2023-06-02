module.exports = {
    "env": {
        "es6": true,
        "browser": true,
        "amd": true,
      "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
      "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
      'arrow-body-style': ['error', 'as-needed'],
    indent: ['error', 2, {SwitchCase: 1}],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    'block-scoped-var': 'error',
    'brace-style': 'error',
    camelCase: 'off',
    'comma-dangle': 'off',
    'comma-spacing': 'error',
    'comma-style': 'error',
    complexity: 'off',
    curly: ['error', 'all'],
    'default-case': 'off',
    'dot-notation': ['error', {allowKeywords: true}],
    'eol-last': 'error',
    eqeqeq: 'error',
    'func-names': 'off',
    'func-style': ['error', 'declaration', {allowArrowFunctions: true}],
    'generator-star': 'off',
    'guard-for-in': 'off',
    'handle-callback-err': 'error',
    'key-spacing': ['error', {beforeColon: false, afterColon: true}],
    'keyword-spacing': 'error',
    'max-depth': ['warn', 4],
    'max-len': ['error', 150],
    'max-nested-callbacks': ['warn', 2],
    'max-params': ['warn', 4],
    'max-statements': ['off', 10],
    'new-cap': 'error',
    'new-parens': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-catch-shadow': 'error',
    'no-cond-assign': ['error', 'always'],
    'no-console': 'off',
    'no-constant-condition': 'error',
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-delete-var': 'error',
    'no-div-regex': 'off',
    'no-dupe-keys': 'error',
    'no-else-return': 'error',
    'no-empty': 'error',
    'no-empty-character-class': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-ex-assign': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-parens': ['error', 'functions'],
    'no-extra-semi': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'off',
    'no-func-assign': 'error',
    'no-implied-eval': 'error',
    'no-inline-comments': 'off',
    'no-inner-declarations': ['error', 'functions'],
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-mixed-requires': ['off', false],
    'no-mixed-spaces-and-tabs': ['error', false],
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-multiple-empty-lines': ['error', {max: 2}],
    'no-native-reassign': 'error',
    'no-negated-in-lhs': 'error',
    'no-nested-ternary': 'off',
    'no-new': 'off',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-require': 'off',
    'no-new-wrappers': 'error',
    'no-obj-calls': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-path-concat': 'off',
    'no-plusplus': 'off',
    'no-process-env': 'off',
    'no-process-exit': 'off',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-regex-spaces': 'error',
    'no-reserved-keys': 'off',
    'no-restricted-modules': 'off',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': ['error', {allow: ['done', 'resolve', 'reject', 'done', 'callBack', 'state']}],
    'no-shadow-restricted-names': 'error',
    'no-spaced-func': 'error',
    'no-sparse-arrays': 'error',
    'no-sync': 'off',
    'no-ternary': 'off',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-undefined': 'off',
    'no-underscore-dangle': 'off',
    'no-unreachable': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': ['error', {vars: 'all', args: 'after-used'}],
    'no-use-before-define': 'error',
    'no-void': 'error',
    'no-var': 'off',
    'no-warning-comments': ['off', {terms: ['todo', 'fixme', 'xxx'], location: 'start'}],
    'no-with': 'error',
    'one-var': ['error', {var: 'always', let: 'always'}],
    'operator-assignment': ['off', 'always'],
    'padded-blocks': 'off',
    'quote-props': 'off',
    quotes: ['error', 'single', {allowTemplateLiterals: true}],
    radix: 'error',
    'sort-vars': 'off',
    'space-after-function-name': ['off', 'never'],
    'space-before-blocks': 'error',
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', {words: true, nonwords: false}],
    'spaced-comment': 'error',
    strict: ['error', 'global'],
    'use-isnan': 'error',
    'valid-jsdoc': 'error',
    'valid-typeof': 'error',
    'vars-on-top': 'off',
    'wrap-iife': 'off',
    'wrap-regex': 'off',
    yoda: 'off',

    // ES2015 RULES
    'arrow-spacing': ['error', {before: true, after: true}],
    'constructor-super': 'error',
    'generator-star-spacing': 'error',
    'no-class-assign': 'error',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'no-this-before-super': 'off',
    'object-shorthand': ['error', 'consistent'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'prefer-reflect': 'error',
    'prefer-template': 'error',
    'require-yield': 'error',
    }
};
