import express,{Request, Response , NextFunction} from 'express';
import { AddFood, GetCurrentOrders, GetFoods, GetOrderDetails, GetOrders, GetVendor, GetVendorProfile, ProcessOrder, UpdateVandorCoverImage, UpdateVendorProfile, UpdateVendorService, VandorLogin } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '_' + file.originalname);
    }

})
const images = multer({storage: imageStorage}).array('images', 10);
router.post('/login',VandorLogin)

router.use(Authenticate)
router.get('/profile',GetVendorProfile)

router.patch('/profile',UpdateVendorProfile)
router.patch('/coverImage',images, UpdateVandorCoverImage)
router.patch('/service',UpdateVendorService)
//Foods Routes
router.post('/food',images,AddFood)
router.get('/foods',GetFoods)
//Order routes 

router.get('/orders', GetCurrentOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id',GetOrderDetails)
router.get('/', (req:Request, res:Response, next:NextFunction) => {
    return res.json('Hello from Vendor ');
});

export {router as VendorRoute}