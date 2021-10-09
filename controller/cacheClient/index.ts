import { promisifyAll } from 'bluebird';
import redis from 'redis';

import { Logger, ILogger } from '../../utils/logger';

import Config from '../../config/config';

//所有的操作加Async变为异步
promisifyAll(redis);
const connects = new Map();

export class CacheClient {
    logger: ILogger;

    host = Config.cacheConfig.host;
    port = Config.cacheConfig.port;
    db = Config.cacheConfig.db;

    constructor() {
        this.logger = new Logger(__filename);
    }
    
    /**
     * Redis创建连接
     * @param name client subscribe publish三种参数值
     */
    client = (name: string)  =>{
        if (!connects.has(name)) {
            const _client = redis.createClient(this.port, this.host,{ db: this.db });
            _client.on('error', (err: any) => {
                this.logger.error('error', err.message || err);
            });
            this.logger.info('Redis初始化成功');
            connects.set(name, _client);
        }
        return connects.get(name);
    }

}