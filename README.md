
### 创建一个初始化的typescript项目
[typescript初始化文档](docs/init.md)

### EsLint配置(vscode版)
[EsLint配置文档](docs/eslint.md)

### ORM使用prisma

选择prisma的原因,模型构造可以直接在一个文件中构造，生成统一的连接客户端客户端,若想使用GraphQL还可以完美兼容

1. 更新模型到数据库 `npx prisma migrate dev --schema=./schema/schema.prisma -n local --preview-feature`
2. 生成client客户端 `npx prisma generate --schema=./schema/schema.prisma`
3. 格式化prisma文件 `npx prisma format --schema=./schema/schema.prisma`

### 当前项目直接使用执行

1. npm i
2. npm run migrate
3. npm run generate
4. npm run dev
