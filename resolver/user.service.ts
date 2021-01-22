import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ApiResponseError, ApiResponseSuccess } from '../config/ApiResponse';


const userLogin = async (req: Request, res: Response, prisma: any, logger: any) => {
    try {
        logger.info('登录验证');
        const result = await prisma.user.update({where:{email:req.body.email},data:{isOnline: req.body.isOnline}});

        const successRes: ApiResponseSuccess = {
            code: HttpStatus.OK,
            msg: result
        };
        return res.json(successRes);
    } catch (err) {
        const error: ApiResponseError = {
            code: HttpStatus.BAD_REQUEST,
            errorObj: err
        };
        return res.json(error);
    }
    
};

const userLogout = async (req: Request, res: Response, prisma: any, logger: any) => {
    try {
        logger.info('注销登录');
        const result = await prisma.user.update({where:{email:req.body.email},data:{isOnline: req.body.isOnline}});

        const successRes: ApiResponseSuccess = {
            code: HttpStatus.OK,
            msg: result
        };
        return res.json(successRes);
    } catch (err) {
        const error: ApiResponseError = {
            code: HttpStatus.BAD_REQUEST,
            errorObj: err
        };
        return res.json(error);
    }
    
};


const userRegister = async (req: Request,res: Response, prisma: any, logger: any) => {
    try {
        
        logger.info('userInfo', req.body);
        const result = await prisma.user.create({data:req.body});
        logger.info('创建结果', result);
        const successRes: ApiResponseSuccess = {
            code: HttpStatus.OK,
            msg: result
        };
        return res.json(successRes);
    } catch (err) {
        logger.error('errrrr', err);
        
        const error: ApiResponseError = {
            code: HttpStatus.BAD_REQUEST,
            errorObj: err
        };
        return res.json(error);
    }
    
};

export {
    userLogin,
    userLogout,
    userRegister
};