import { Request, Response, NextFunction } from 'express';



export class Routes { 
    
    
    public routes(app: any): void {   

        
        app.get('/',(req:Request,res:Response)=>{
            res.send('Hello Typescript');
        });


        app.route('/contact')
            .post((req: Request, res: Response, next: NextFunction) => {
            // middleware
                console.log(`Request from: ${req.originalUrl}`);
                console.log(`Request type: ${req.method}`);  
                console.log('Request Query: ${req}', JSON.stringify(req.body));  
                next();                        
            }, (req: Request, res: Response) => {
                res.send('success');
            }); 
    }
}
 
