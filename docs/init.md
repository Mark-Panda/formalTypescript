## 初始化typescript项目流程

### 执行以下内容全局已经存在的可以省略

1. npm i express -g
2. express 项目名
3. 删除所有的js和css文件，保留文件夹和bin下的www及其内容
4. npm i
5. npm i typescript ts-node nodemon --save-dev
6. npx tsc --init
    > 修改`tsconfig.json`内容如下\
        "outDir": "./dist",\
        "rootDir": "./",   
7. npm i concurrently -D
8. npm install @types/express -D
9. npm i @types/node -D
10. 修改 bin/www里
    > var app = require('../app');  => var app = require('../dist/app');
11. 修改package.json中的scripts
    > "dev:serve": "nodemon ./bin/www",\
"dev:build": "npx tsc -w",\
"serve": "concurrently npm:dev:*"

