import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';
import Config from '../config/config';
import { Routes } from './routes';
import { SocketRoutes } from './socketRoute';
import { Logger, ILogger } from '../utils/logger';
import { PrismaClient } from '../controller/mysqlClient/client';
import { CacheClient } from '../controller/cacheClient';
import { Producer } from '../rabbitMQ/product';

const port = normalizePort(process.env.PORT || Config.baseconfig.port);
const logger: ILogger = new Logger(__filename);
export class App {
    Config = Config;
    public app: express.Application = express();
    //http server
    public httpServer = createServer(this.app);
    //socket.io
    public io: Server = new Server(this.httpServer, { /* options */ });
    
    //http路由
    public routePrv: Routes = new Routes();
    //socket路由
    public routeSocket: SocketRoutes = new SocketRoutes();
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
    channel: Producer;

    constructor() {
        //初始化MQ连接
        this.channel = new Producer();
        this.config();
        this.routePrv.routes(this.app, this.prisma, logger, this.cacheClient, this.channel); 
        this.routeSocket.socketRoute(this.app, this.prisma, logger, this.cacheClient, this.channel, this.io); 
        
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
        this.httpServer.listen(port);
        this.httpServer.on('error', this.onError);
        this.httpServer.on('listening', this.onListening);
    }

   

    /**
     * Event listener for HTTP server "error" event.
     */
    onError(error:any) :any{
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */
    onListening(): any {
        logger.info(`Server started at http://${Config.host}:${port}`);
    }
}


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) :any {
    let port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
