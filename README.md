
### 创建一个初始化的typescript项目
[typescript初始化文档](docs/init.md)

### EsLint配置(vscode版)
[EsLint配置文档](docs/eslint.md)

### ORM使用prisma

选择prisma的原因,模型构造可以直接在一个文件中构造，生成统一的连接客户端客户端,若想使用GraphQL还可以完美兼容

1. 更新模型到数据库 `npx prisma migrate dev --schema=./schema/schema.prisma -n local --preview-feature`
2. 生成client客户端 `npx prisma generate --schema=./schema/schema.prisma`
3. 格式化prisma文件 `npx prisma format --schema=./schema/schema.prisma`

### RabbitMQ

RabbitMQ的选用是为了充当定时任务的处理和其他队列消息的处理。 


项目中使用 `DLX(死信队列) + TTL` 实现定时任务，存在一个时序问题，所以任务时间使用的是相同的时间，保证顺序一致性。
> 所以，请先安装 `RabbitMQ` 在服务器上,本地安装或者使用`docker`安装都可以。请自行寻找安装方法。Mac建议使用`brew`安装，方便管理。

### 当前项目直接使用执行
> 请保证已经安装 `RabbitMQ`, `MySql`, `Redis`
1. `npm install`        安装node_modules包
2. `npm run migrate`    模型数据同步到数据库中
3. `npm run generate`   生成client客户端用于与数据库交互
4. `npm run dev`        启动服务
