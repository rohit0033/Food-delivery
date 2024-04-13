import express , {Request,Response, NextFunction} from 'express';
import { GetFoodAvailability, GetFoodsIn30Min, GetTopResturants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();
/* Food availabilty */

router.get('/:pincode',GetFoodAvailability)

/* Top resturants */
router.get('/top-restarunts/:pincode',GetTopResturants)

/* Foood available in 30 minutes */

router.get('/foods-in-30-min/:pincode',GetFoodsIn30Min)

/*  Search food */

router.get('/search/:pincode',SearchFoods)


/* find resturant by their id */

router.get('/resturant/:id',RestaurantById);

export {router as ShoppingRoute};