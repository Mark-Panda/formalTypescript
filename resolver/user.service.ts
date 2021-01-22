import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponseError, ApiResponseSuccess } from '../config/ApiResponse';

/**
 * 
 * @param req Request
 * @param res Response
 * @param prisma prisma客户端,与数据库通信
 * @param logger 日志记录
 */
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

/**
 * 
 * @param req Request
 * @param res Response
 * @param prisma prisma客户端,与数据库通信
 * @param logger 日志记录
 */
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

/**
 * 
 * @param req Request
 * @param res Response
 * @param prisma prisma客户端,与数据库通信
 * @param logger 日志记录
 */
const userRegister = async (req: Request,res: Response, prisma: any, logger: any) => {
    try {
        
        logger.info('userInfo', req.body);
        req.body.id = uuidv4();
        const result = await prisma.user.create({data:req.body});
        logger.info('创建结果', result);
        const successRes: ApiResponseSuccess = {
            code: HttpStatus.OK,
            msg: result
        };
        return res.json(successRes);
    } catch (err) {
        logger.error('错误信息', err);
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