import bycrypt from 'bcrypt'
import { VendorPayload } from '../dto'
import { APP_SECRET } from '../config'
import jwt from 'jsonwebtoken';
// import express, { Request} from 'express';
import { AuthpayLoad } from '../dto/Auth.dto';
import { Request } from 'express';

export const GenerateSalt  = async () =>{
    return await bycrypt.genSalt(10)
}

export const GeneratePassword = async (password: string, salt: string) => {
    return await bycrypt.hash(password, salt)
}

export const ValidatePassword = async (enteredPassword: string, savedPassword:string,salt: string,) => {
    const hashedPassword = await GeneratePassword(enteredPassword, salt);
    return hashedPassword === savedPassword;
}


export const GenerateSignature = (payload:AuthpayLoad) =>{
    return jwt.sign(payload,APP_SECRET,{expiresIn: "1d"})
}
export const ValidateSignature  = async(req: Request) => {

    

    const signature = req.get('Authorization');

    if (signature) {
        try {
            const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthpayLoad; 
            req.user = payload;
            return true;
        } catch (err) {
            return false;
        } 
    }
    return false
};