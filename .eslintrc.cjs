module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'plugin:prettier/recommended',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
  }
}
