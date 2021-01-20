import express from 'express';
import bodyParser from 'body-parser';
import { Routes } from '../routes/routes';
import path from 'path';
import Config from './config';

class App {

    public app: express.Application = express();
    //路由
    public routePrv: Routes = new Routes();

    constructor() {
        this.config();
        this.routePrv.routes(this.app);     
    }

    //配置中间件
    private config(): void{
        
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static('public'));
        this.app.set('views', path.join(Config.rootPath, 'views'));
        this.app.set('view engine', 'ejs');
    }
}
export default new App().app;



