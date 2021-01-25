import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy, StrategyOptions } from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';
import { Strategy } from 'passport';
import config from '../config/config';
import { PrismaClient } from '../controller/mysqlClient/client';
import { Logger, ILogger } from '../utils/logger';

const { auth,cacheConfig } = config;


export class AuthHandler {

    prisma = new PrismaClient();
    jwtOptions: StrategyOptions;
    superSecret = auth.secretKey;
    logger: ILogger;

    constructor() {
        this.jwtOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // HEADER: Authorization: bearer JSON_WEB_TOKEN_STRING.....
            secretOrKey: this.superSecret
        };
        this.logger = new Logger(__filename);
    }

    /**
     * 初始化Auth中间件并为Passport配置JWT策略
     */
    initialize() {
        passport.use('jwt', this.getStrategy());
        return passport.initialize();
    }

    /**
     * 配置并返回JWT护照策略
     */
    getStrategy(): Strategy {
        return new JWTStrategy(this.jwtOptions, async (jwt_payload, next) => {
            try {
                const user = await this.prisma.user.findUnique({ where: { email: jwt_payload.email } }); // todo: change to uuid ?
                if (!user) {
                    return next(null, false);
                }
                // 认证通过
                return next(undefined, {
                    id: user.id,
                    email: user.email
                });

            } catch (err) {
                return next(null, false);
            }
        });
    }

    /**
     * 身份验证处理程序。 呼叫此路由需要身份验证
     */
    authenticate() {
        return passport.authenticate('jwt', { session: false, failWithError: true });
    }

    /**
     * 有过期时间的生成token
     * @param user
     */
    generateToken(user: any): string {
        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, this.superSecret, {
            expiresIn: cacheConfig.ttl  //1天过期
        });
        return token;
    }

    /**
     * 解密token信息
     * @param token 
     */
    decodeToken(token: string): any {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.superSecret, (error, decoded) => {
                if (error) {
                    console.log(error.message);
                    return reject(error.message);
                }
                return resolve(decoded);
            });
        });
    }

    /**
     * 生成token存放Redis
     * @param user
     */
    getToken(cache: any): any {
        return async (req: Request, res: Response, next: NextFunction) => {
            const user = await this.prisma.user.findUnique({ where: { email: req.body.email } });
            if (user) {
                const token = this.generateToken(user);
                await cache.setAsync(token, user.email,  'EX', cacheConfig.ttl, 'NX');
                req.body.token = token;
                next();
            } else {
                res.json({
                    code: 202,
                    msg:'用户信息不正确'
                });
            }
        };
    }


    /**
     * 自定义的jwt验证中间件,验证jwt,若已过期则重新生成token
     */
    checkToken(cache:any): any {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const token = req.headers.authorization?.substring('Bearer '.length).trim();
                if (!token) {
                    return res.json({
                        code: 202,
                        msg: '身份验证失败'
                    });
                }
                const newtoken = await this.renewToken(token, req.body);
                if (newtoken !== token) {
                    await cache.setAsync(newtoken, req.body.email, 'EX', cacheConfig.ttl, 'NX');
                }
                req.body.token = newtoken || token;
                next();
            } catch (error) {
                this.logger.error('异常信息', error);
                res.json({
                    code: 202,
                    msg: error
                });
            }
        };
    }


    /**
     * token到期后重新生成新的token返回
     * @param token 
     */
    renewToken(token: string, user: any): any {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.superSecret, (error, decoded) => {
                if (error) {
                    this.logger.error('jwt验证错误信息', error.message);
                    console.log(error.message);
                    if (error.message === 'jwt expired') {
                        const userInfo = this.prisma.user.findUnique({ where: { email: user.email } });
                        const newToken = this.generateToken(userInfo);
                        return resolve(newToken);
                    }
                    return reject(error.message);
                }
                return resolve(token);
            });
        });
    }
    
}

