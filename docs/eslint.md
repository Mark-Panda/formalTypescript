### ESlint配置 vscode下

1. npm i eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
2. 项目目录下新建 `.eslintrc.js`
```js
module.exports = {
  'parser': '@typescript-eslint/parser',
  'plugins': ['@typescript-eslint'],
  'rules': {
    'no-var': 'error',// 不能使用var声明变量
    'no-extra-semi': 'error',
    '@typescript-eslint/indent': ['error', 4],
    'import/extensions': 'off',
    'linebreak-style': [0, 'error', 'windows'],
    'indent': ['error', 4, { SwitchCase: 1 }], // error类型，缩进2个空格
    'space-before-function-paren': 0, // 在函数左括号的前面是否有空格
    'eol-last': 0, // 不检测新文件末尾是否有空行
    'semi': ['error', 'always'], // 在语句后面加分号
    'quotes': ['error', 'single'],// 字符串使用单双引号,double,single
    'no-console': ['error', { allow: ['log', 'warn'] }],// 允许使用console.log()
    'arrow-parens': 0,
    'no-new': 0,//允许使用 new 关键字
    'comma-dangle': [4, 'never'], // 数组和对象键值对最后一个逗号， never参数：不能带末尾的逗号, always参数：必须带末尾的逗号，always-multiline多行模式必须带逗号，单行模式不能带逗号
    'no-undef': 0
  },
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module',
    'ecmaFeatures': {
      'modules': true
    }
  }
};
```
3. 项目目录下新建 `.vscode`文件夹,内部新建 `settings.json`
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
4. vscode设置中搜索 `emmet.include`在`settings.json`文件中增加配置,设置保存自动格式化文档
```json
"[typescript]": {
    "editor.formatOnType": true,
    "editor.formatOnSave": true
  },
```
5. 在ts文件中保存测试，点击小灯牌允许生效。
