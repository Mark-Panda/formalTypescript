import amqp from 'amqplib';
import Config from '../config/config';

/**
 * 消费者
 */
export class Consumer {
    channel: Promise<amqp.Channel>;

    constructor() {
        this.channel = this.init();
        this.consumer();
    }

    init = async () => {
        // 1. 创建链接对象
        const connection = await amqp.connect(Config.rabbitMQConfig.url);
        // 2. 获取通道
        const channel = await connection.createChannel();
        return channel;
    }

    /**
     * 消费一个死信队列 == 定时任务
     */
    consumer = async () => {
        console.log('rabbitMQ定时任务已创建');
        const timedTaskExchangeDLX = 'timedTaskExDLX';  //死信队列交换器
        const timedTaskRoutingKeyDLX = 'timedTaskDLX';  //死信队列路由
        const timedTaskQueueDLX = 'timedTaskQueueDLX';  //定时任务执行的队列

        await (await this.channel).assertExchange(timedTaskExchangeDLX, 'direct', { durable: true });
        const queueResult = await (await this.channel).assertQueue(timedTaskQueueDLX, {
            exclusive: false
        });
        await (await this.channel).bindQueue(queueResult.queue, timedTaskExchangeDLX, timedTaskRoutingKeyDLX);
        await (await this.channel).consume(queueResult.queue, (msg: any) => {
            const jsonInfo = JSON.parse(msg.content);
            console.log('消费信息：', jsonInfo);
            console.log('消费者的定时任务逻辑在这里开始');
            
        }, { noAck: true });
        
        
        
    }
}


