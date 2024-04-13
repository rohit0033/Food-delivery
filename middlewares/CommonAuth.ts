import { Request, NextFunction, Response } from 'express'

import { ValidateSignature } from '../utility';
import { AuthpayLoad } from '../dto';

declare global {
    namespace Express{
        interface Request{
            user?: AuthpayLoad
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const signature = await ValidateSignature(req);
    if(signature){
        return next()
    }else{
        return res.json({message: "User Not authorised"});
    }
}