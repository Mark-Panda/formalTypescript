import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
const limitInfo = config.baseconfig.limitRequest;
const RATE = limitInfo.rate || 1000; //桶的流速，单位毫秒，桶内数量的流失速度
let initNum = 0;

export class WarmUpController {
    count: number = 0;
    coldFactor: any;
    lastFilledTime: any;
    thresholdPermits: any;
    maxPermits: any;
    slope: any;
    storedPermits: number;

    constructor(count: number, warmUpPeriod: any, coldFactor: any) {
        // super();
        this.count = count; //每秒允许通过的请求数量
        this.coldFactor = coldFactor; //冷却因子
        this.lastFilledTime = Date.now();

        // 假设系统从开始进入稳定期到完全稳定(令牌的获取速度和令牌的加入速度持平，storedPermits = 0) 所需的时间占令牌完全消耗的时间的 1/coldFactor，
        // 即 thresholdPermits*stableInterval/(thresholdPermits*stableInterval + warmUpPeriod) = 1/coldFactor，
        // 而从上面的函数图形中我们知道预热时间为梯形面积 warmUpPeriod = 0.5*(stableInterval + coldInterval)*(maxPermits - thresholdPermits)；

        //令牌桶阈值  超过该值时开启预热
        this.thresholdPermits = (warmUpPeriod * count) / (coldFactor - 1);
        //令牌桶中最大令牌数
        this.maxPermits =
            this.thresholdPermits + (2 * warmUpPeriod * count) / (1 + coldFactor);

        // 预热期比例常数
        // this.slope =
        //     ((coldFactor - 1) * (this.maxPermits - this.thresholdPermits)) / count;
        this.slope =
            (coldFactor - 1) / count / (this.maxPermits - this.thresholdPermits);
        // 剩余令牌数
        this.storedPermits = this.maxPermits;
    }

    // 判断当前请求是否能通过
    canPass(node: any, acquireCount: number): boolean {
        //当前的Qps
        const currentQps = node.passQps;
        // const currentQps = node.passQps();
        //上个时间窗口的Qps
        this.resync(node.previousPassQps);
        // this.resync(node.previousPassQps());
        let cost;
        //令牌中剩余的数量 > 令牌桶阈值 开启预热
        if (this.storedPermits > this.thresholdPermits) {
            // 处于预热期的令牌数
            const warmUpPermits = this.storedPermits - this.thresholdPermits;
            if (acquireCount < warmUpPermits) {
                cost = this.slope * acquireCount;
            } else {
                //根据斜率计算出预热时的Qps
                cost =
                    this.slope * warmUpPermits +
                    (1 / this.count) * (acquireCount - warmUpPermits);
            }
            if (currentQps + acquireCount < 1 / cost) {
                return true;
            }
        } else {
            //剩余令牌小于令牌桶阈值  不开启预热  流量稳定运行
            if (currentQps + acquireCount < this.count) {
                return true;
            }
        }
        return false;
    }

    resync(passQps: number)  {
        let currentTime = Date.now();
        currentTime = currentTime - (currentTime % 1000);
        const oldLastFillTime = this.lastFilledTime;
        if (currentTime <= oldLastFillTime) {
            return;
        }
        this.storedPermits = this.coolDownTokens(currentTime, passQps);

        const currentValue = this.storedPermits - passQps;
        this.storedPermits = Math.max(currentValue, 0);
        this.lastFilledTime = currentTime;
    }

    coolDownTokens(currentTime: any, passQps: number) {
        const oldValue = this.storedPermits;
        let newValue = oldValue;

        // 添加令牌的判断前提条件:
        // 当令牌的消耗程度远远低于警戒线的时候
        if (oldValue < this.thresholdPermits) {
            newValue =
                oldValue + ((currentTime - this.lastFilledTime) * this.count) / 1000;
        } else if (oldValue > this.thresholdPermits) {
            if (passQps < this.count / this.coldFactor) {
                newValue =
                    oldValue + ((currentTime - this.lastFilledTime) * this.count) / 1000;
            }
        }
        return Math.min(newValue, this.maxPermits);
    }
}

/**
 * 限流中间件服务
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} redisClient Redis连接Client
 */
const limitFunc = (redisClient: any) => {
    return async function(req: Request, res: Response, next: NextFunction) {
        const warmupRatelimit = new WarmUpController(
        /** QPS 阈值 */
            100,
            // RATE,
            /** 预热时间 */
            10,
            /** 冷却因子 */
            3
        );

        let now = Date.now();
        let reqTime;
        //获取当前的Qps
        let passQps = 1;
        let previousPassQps = 0;
        const exists =  await redisClient.exists('ratelimitReqTime');
        const numExist = await redisClient.get('ratelimitNum');
        if (!exists) {
            await redisClient.set('ratelimitReqTime', now);
            reqTime = now;
        } else {
            reqTime = await redisClient.get('ratelimitReqTime');
            await redisClient.set('ratelimitReqTime', now);
        }
        //一秒以内
        if (now - reqTime < 1000) {
            if (numExist) {
                passQps = await redisClient.get('ratelimitNum');
                passQps += 1;
            } else {
                await redisClient.set('ratelimitNum', passQps, 'EX', 1, 'NX');
            }
            previousPassQps = passQps;
        }
        console.log('555555', initNum);
        initNum = initNum + 1;
        const node = {
            passQps: passQps,
            previousPassQps: previousPassQps
        };
        // node 里记录了当前接口/资源的 qps 等信息
        if (!warmupRatelimit.canPass(node, initNum)) {
        // 返回请求被限流的错误
            initNum = initNum === 0 ? 0 : initNum - 1;
            return res.status(429).json({ msg: 'you have too many requests' });
        }
        next();
        console.log('---11111', initNum);
        // 如何在res返回数据时对 initNum 进行减操作
        initNum = initNum === 0 ? 0 : initNum - 1;
    };
    
};


export { limitFunc };