import { Request, Response, NextFunction } from 'express';
import { Logger, ILogger } from '../utils/logger';
import { userLogin, userRegister, userLogout } from '../resolver/user.service';
import { AuthHandler } from '../middleware/authHandler';
import Config from '../config/config';

export class Routes { 
    auth = new AuthHandler();
    
    public routes(app: any, prisma: any, logger: any): void {   

        
        app.get('/',async (req: Request, res: Response) => {
            res.render('index', { title: Config.baseconfig.title });
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
            
            console.log('REQ', prisma.user);
            const user = await prisma.user.findUnique({where:{email:req.body.email}});
            const token = this.auth.generateToken(user);
            console.log('token', token);
            res.json({
                code: 200,
                msg: token
            });
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
 
