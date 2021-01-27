import amqp from 'amqplib';
import { Consumer } from './consumer';
import Config from '../config/config';
import { Logger, ILogger } from '../utils/logger';
 
/**
 * 生产者
 */
export class Producer {
    consumer: () => Promise<void>;
    logger: ILogger;
    connection: Promise<amqp.Connection>;

    constructor() {
        this.logger = new Logger(__filename);
        this.connection = this.init();
        //初始化消费者
        this.consumer = new Consumer().consumer;
    }

    /**
     * 生产者创建连接
     */
    init = async () => {
        // 创建链接对象
        const connection = await amqp.connect(Config.rabbitMQConfig.url);
        return connection;
    }


    /**
     * 路由一个死信队列  定时器 消息发送后1000毫秒执行
     * @param num 
     */
    publishMsg = async (msgObj: Object, time: number) => {
        this.logger.info('生产者消息：', msgObj);
        //创建通道
        const channel = await (await this.connection).createChannel();
        const timedTaskExchange = 'timedTaskEx';  //交换器
        const timedTaskQueue = 'timedTaskQu';     //生产者发送的队列
        const timedTaskExchangeDLX = 'timedTaskExDLX';   //死信队列交换器
        const timedTaskRoutingKeyDLX = 'timedTaskDLX';   //死信队列路由
        await channel.assertExchange(timedTaskExchange, 'direct', { durable: true });
        const queueResult = await channel.assertQueue(timedTaskQueue, {
            exclusive: false,
            deadLetterExchange: timedTaskExchangeDLX,
            deadLetterRoutingKey: timedTaskRoutingKeyDLX
        });
        await channel.bindQueue(queueResult.queue, timedTaskExchange, 'direct');
        
        await channel.sendToQueue(queueResult.queue, Buffer.from(`${JSON.stringify(msgObj)}`), {
            expiration: time * 1000 //延迟消费，相当于定时执行，针对消息级别  time表示多少秒  expiration是毫秒级别的
        });

        await channel.close();
    }
}

