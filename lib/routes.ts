import { Request, Response, NextFunction } from 'express';
import { userReg } from '../resolver/user.service';
import { AuthHandler } from '../middleware/authHandler';

export class Routes { 
    auth = new AuthHandler();
    
    public routes(app: any, prisma: any): void {   

        
        app.get('/',async (req: Request, res: Response) => {
            console.log('REQ', await prisma.user.findMany());
            res.send('Hello Typescript');
        });

        /**
         * 核对token
         */
        app.use(this.auth.initialize());
        app.post('/checkJwtToken', this.auth.authenticate(),async (req: Request, res: Response) => {
            console.log('REQ', await prisma.user.findMany());
            
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

        app.get('/text', async (req: Request, res: Response) => {
            await userReg(req, res, prisma);
        });
        
    }
}
 
