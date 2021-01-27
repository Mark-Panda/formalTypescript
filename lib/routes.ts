import { Request, Response, NextFunction } from 'express';
import { Logger, ILogger } from '../utils/logger';
import { userLogin, userRegister, userLogout } from '../resolver/user.service';
import { AuthHandler } from '../middleware/authHandler';
import Config from '../config/config';

import { PrismaClient } from '../controller/mysqlClient/client';
export class Routes { 
    auth = new AuthHandler();
    
    public routes(app: any, prisma: PrismaClient, logger: ILogger, cache: any, channel: any): void {   

        
        app.get('/', async (req: Request, res: Response) => {
            await channel.publishMsg({ title: '测试队列'}, 60);
            res.render('index', { title: Config.baseconfig.title });
        });

        /**
         * token存放于Redis的生成token的接口
         */
        app.post('/getToken', this.auth.getToken(cache), async (req: Request, res: Response) => {
            res.json({
                msg:req.body
            });
        });

        /**
         * token存放于Redis的检验token的接口
         */
        app.post('/checkToken', this.auth.checkToken(cache), async (req: Request, res: Response) => {
            res.json({
                msg: req.body
            });
        });

        /**
         * 核对token
         */
        app.use(this.auth.initialize());
        app.post('/checkJwtToken', this.auth.authenticate(),async (req: Request, res: Response) => {
            res.json({
                code: 200,
                msg: 'success'
            });
        });

        /**
         * 生成token
         */
        app.post('/takeToken', async (req: Request, res: Response) => {
            logger.info('Prisma操作方法', prisma);
            const user = await prisma.user.findUnique({where:{email:req.body.email}});
            const token = this.auth.generateToken(user);
            logger.info('token', token);
            res.json({
                code: 200,
                msg: token
            });
        });


        /**
         * 解密token
         */
        app.post('/decodeToken', async (req: Request, res: Response) => {
            try {
                const token = req.headers.authorization?.substring('Bearer '.length).trim();
                let tokenDecode = {};
                if (token) {
                    tokenDecode = await this.auth.decodeToken(token);
                    console.log('redis', await cache.existsAsync('ssss'));
                }
                res.json({
                    code: 200,
                    msg: tokenDecode
                });
            } catch (error) {
                logger.error('异常信息', error);
                if (error === 'jwt expired') {
                    return res.json({
                        code: 200,
                        msg: 'token已过期,请重新申请token!'
                    });
                }
                res.json({
                    code: 200,
                    msg: 'token验证失败'
                });
            }
            
        });

        /**
         * 注册
         */
        app.post('/register', async (req: Request, res: Response) => {
            await userRegister(req, res, prisma, logger);
        });

        /**
         * 登录
         */
        app.post('/login',this.auth.authenticate(), async (req: Request, res: Response) => {
            await userLogin(req, res, prisma, logger);
        });

        /**
         * 退出登录
         */
        app.post('/logout',this.auth.authenticate(), async (req: Request, res: Response) => {
            await userLogout(req, res, prisma, logger);
        });
        
    }
}
 
