import amqp from 'amqplib';
import Config from '../../config/config';
import { Logger, ILogger } from '../../utils/logger';

/**
 * 消费者
 */
export class Consumer {
    logger: ILogger;
    connection: Promise<amqp.Connection>;

    constructor() {
        this.logger = new Logger(__filename);
        this.connection = this.init();
        this.consumer();
        
    }

    init = async () => {
        // 创建链接对象
        const connection = await amqp.connect(Config.rabbitMQConfig.url);
        return connection;
    }

    /**
     * 消费一个死信队列 == 定时任务
     */
    consumer = async () => {
        //创建通道
        const channel = await (await this.connection).createChannel();
        this.logger.warn('rabbitMQ定时任务已创建');

        const timedTaskExchangeDLX = 'timedTaskExDLX';  //死信队列交换器
        const timedTaskRoutingKeyDLX = 'timedTaskDLX';  //死信队列路由
        const timedTaskQueueDLX = 'timedTaskQueueDLX';  //定时任务执行的队列

        await channel.assertExchange(timedTaskExchangeDLX, 'direct', { durable: true });
        const queueResult = await channel.assertQueue(timedTaskQueueDLX, {
            exclusive: false
        });
        await channel.bindQueue(queueResult.queue, timedTaskExchangeDLX, timedTaskRoutingKeyDLX);
        await channel.consume(queueResult.queue, (msg: any) => {
            const jsonInfo = JSON.parse(msg.content);
            this.logger.info('消费信息：', jsonInfo);
            this.logger.warn('消费者的定时任务逻辑在这里开始');
        }, { noAck: true });
    }
}


