import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Config from '../config/config';
import { Routes } from './routes';
import { Logger, ILogger } from '../utils/logger';
import { PrismaClient } from '../controller/mysqlClient/client';
import { CacheClient } from '../controller/cacheClient';


export class App {
    Config = Config;
    logger: ILogger;
    public app: express.Application = express();
    //路由
    public routePrv: Routes = new Routes();
    //连接数据库
    public prisma = new PrismaClient({
        log: [
            {
                emit: 'stdout',
                level: 'query'
            },
            {
                emit: 'stdout',
                level: 'info'
            },
            {
                emit: 'stdout',
                level: 'warn'
            }
        ],
        errorFormat: 'pretty'
    });
    //连接Redis
    public cacheClient = new CacheClient().client('client');

    constructor() {
        this.logger = new Logger(__filename);
        this.config();
        this.routePrv.routes(this.app, this.prisma, this.logger, this.cacheClient); 
        
    }

    //配置中间件
    private config(): void{
        
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static('public'));
        this.app.set('views', path.join(Config.rootPath, 'views'));
        this.app.set('view engine', 'ejs');
    }

    //启动服务
    startServer = () => {
        this.app.listen(this.Config.baseconfig.port, () => {
            this.logger.info(`Server started at http://${this.Config.host}:${this.Config.baseconfig.port}`);
        });
    }

    
}



