import { Request ,  Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto/Vendor.dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

// In the code we cans ee that we are using find function with mail or id so that we are creating funtion for ease

export const FindVendor = async(id: string| undefined , email?: string)=>{
    if(email){
        return await Vendor.findOne({email: email});

    }else{
        return await Vendor.findById(id);

    }

}



export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    const{name,address, pincode,foodType,email,password,ownerName,phone} = <CreateVendorInput>req.body;

    const existingVendor = await FindVendor("",email);
    if(existingVendor !== null){
        return res.json({"message": "Vendor already exists"});
    }

   
    const salt = await GenerateSalt()
    const HashedPassword = await GeneratePassword(password,salt);

    const createdVandor = await Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: HashedPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods:[]
    })
    
    return res.json(createdVandor);
}
export const GetVendor = async (req: Request, res: Response, next: NextFunction) => {
    const vendors = await Vendor.find();
    if(vendors!=null) {
        return res.json(vendors);
    }
    return res.json({"message": "No Vendor Found"})
    
}
export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {
    const vendorId  = req.params.id;
    const vendor  =  await FindVendor(vendorId)
    if(vendor != null) {
        return res.json(vendor);
    }
    return res.json({"message": "Vendor data not availabel"});
    
}