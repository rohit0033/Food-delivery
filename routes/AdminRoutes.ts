import express,{Request, Response , NextFunction} from 'express';
import { CreateVendor, GetVendor, GetVendorByID } from '../controllers';

const router = express.Router();


router.post('/vendor',CreateVendor)
router.get('/vendors',GetVendor)
router.get('/vendors/:id',GetVendorByID)


router.get('/', (req:Request, res:Response, next:NextFunction) => {
    return res.json('Hello from Admin ');
});

export {router as AdminRoute}