import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ApiResponseError, ApiResponseSuccess } from '../config/ApiResponse';

const userReg = async (req: Request, res: Response, prisma: any) => {
    try {
        const result = await prisma.user.findMany();

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

export {
    userReg
};