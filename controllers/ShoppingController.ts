import { Request ,  Response, NextFunction } from "express";
import { FoodDoc, Vendor } from "../models";

export const GetFoodAvailability =async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode, serviceAvailable:false})
    .sort([['rating','descending']])
    .populate("foods")

    if(result.length>0){
        return res.status(200).json(result)
    }
    return res.status(400).json({message : "data not found"})

}
export const GetTopResturants =async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode, serviceAvailable:false})
    .sort([['rating','descending']])
    .limit(1)

    if(result.length>0){
        return res.status(200).json(result)
    }
    return res.status(400).json({message : "data not found"})


}
export const GetFoodsIn30Min =async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode, serviceAvailable:false})
    .sort([['rating','descending']])
    .populate("foods")

    if(result.length>0){

        let foodResult : any =[];
        result.map(vendor => {
            const food = vendor.foods as [FoodDoc];
            foodResult.push(...food.filter(
                food => food.readyTime <= 30));

       
        })
        return res.status(200).json(foodResult);
    }
    return res.status(400).json({message : "data not found"})


}
export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    const result = await Vendor.find({ pincode: pincode, serviceAvailable: false})// Later change it to true
    .populate('foods');
 
    if(result.length > 0){
        let foodResult: any = [];
        result.map(item => foodResult.push(...item.foods));
        return res.status(200).json(foodResult);
    }
    return res.status(404).json({ msg: 'data Not found!'});
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;
    
    const result = await Vendor.findById(id).populate('foods')
    
    if(result){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});
}
