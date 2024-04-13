import express, { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { CreateCustomerInput, EditCustomerProfileInput, OrderInputs, UserLoginInput } from '../dto/Customer.dto';
import { validate } from 'class-validator';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer } from '../models/Customer';
import { Food, Order } from '../models';
import mongoose from 'mongoose';


export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(CreateCustomerInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, phone, password } = customerInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    // const existingCustomer =  await Customer.findOne({ email: email});
    
    // if(existingCustomer !== null){
    //     return res.status(400).json({message: 'Email already exist!'});
    // }

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
        orders: []
    })

    if(result){
        // send OTP to customer
        await onRequestOTP(otp, phone);
        
        //Generate the Signature
        const signature = await GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        // Send the result
        return res.status(201).json({signature, verified: result.verified, email: result.email})

    }

    return res.status(400).json({ msg: 'Error while creating user'});

}


export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, password } = customerInputs;
    const customer = await Customer.findOne({ email: email});
    if(customer){
        const validation = await ValidatePassword(password, customer.password, customer.salt);
        
        if(validation){

            const signature = GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })

            return res.status(200).json({
                signature,
                email: customer.email,
                verified: customer.verified
            })
        }
    }

    return res.json({ msg: 'Error In log In'});

    
}
export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const {otp} = req.body;

    const customer =  req.user;
    if(customer){
        const profile  =  await Customer.findById(customer._id);

        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;
                const updatedProfile = await profile.save();
               const signature  = await GenerateSignature({
                     _id: updatedProfile._id,
                     email: updatedProfile.email,
                     verified: updatedProfile.verified
               })
                return res.status(200).json({signature:signature, verified: updatedProfile.verified, email: updatedProfile.email});
            }
        }
    }
    return res.status(200).json({ message : "Error in validation"})


}


export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer =  req.user;
    if(customer){
        const profile  =  await Customer.findById(customer._id);

        if(profile){
            const { otp, expiry } = GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            await profile.save();
            await onRequestOTP(otp, profile.phone);
            return res.status(200).json({message: "OTP sent successfully"});
        }
    }
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    
 
    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
             
            return res.status(201).json(profile);
        }

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});


}


export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = customerInputs;

    if(customer){
        console.log("hello")
        const profile =  await Customer.findById(customer._id);
        console.log(profile)
        
        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save()
            
            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});
}

// Cart order functionality 
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id);
        let cartItems = Array();
        const {id,unit} = <OrderInputs>req.body
        const food  =  await Food.findById(id);
        if(food){
            if(profile != null){
                cartItems = profile.cart;
                
                if(cartItems.length > 0){
                    let existFoodItem  = cartItems.filter((item)=> item.food._id.toString() == id);
                   
                    if(existFoodItem.length > 0){
                        const index = cartItems.indexOf(existFoodItem[0]);
                       
                        if(unit>0){
                            cartItems[index]= {food:food,unit:unit};


                        }else{
                            cartItems.splice(index,1);
                        }
                    }else{
                        cartItems.push({food:food,unit:unit});
                    }

                }else{
                    cartItems.push({food:food,unit:unit});
                
                }
                if(cartItems){
                    profile.cart = cartItems as any;
                    const CartResult = await profile.save();
                   
                    return res.status(201).json(CartResult.cart);
                }
            }
        }
    }
    return res.status(400).json({ msg: 'Error while Adding to Cart'});

}
export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

      
    const customer = req.user;
    
    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){
            return res.status(200).json(profile.cart);
        }
    
    }

    return res.status(400).json({message: 'Cart is Empty!'})

}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

   
    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate('cart.food').exec();

        if(profile != null){
            profile.cart = [] as any;
            const cartResult = await profile.save();

            return res.status(200).json(cartResult);
        }

    }

    return res.status(400).json({message: 'cart is Already Empty!'})

}

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const customer =  req.user;

    if(customer){
        const orderId = `${Math.floor(Math.random() * 89999)+1000}`;

        const profile = await Customer.findById(customer._id);

        const cart = <[OrderInputs]>req.body;

        let cartItems = Array();

        let netAmount = 0.0;
        
           
        
        const foodIds = cart.map(item => (item.id)); // Changed from item.id to item._id and convert to ObjectId


        const foods = await Food.find().where('_id').in(foodIds).exec();
        let vendorId;
        foods.map(food => {
            cart.map(({id, unit})=>{
                if(food._id == id){
                    vendorId = food.vendorId;
                    netAmount += (food.price * unit);
                    cartItems.push({food,unit})
                }
            })
        })
        console.log(vendorId)

        if(cartItems){

            const currentOrder = await Order.create({
                orderId: orderId,
                vendorId: vendorId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                paidThrough: 'COD',
                paymentResponse: '',
                remarks: '',
                deliveryId: '',
                appliedOffers: false,
                offerId:null,
                redayTime:45
                
            })

            if(currentOrder){
               if(profile){
                profile.cart = [] as any;
            
                profile.orders.push(currentOrder);
                const profileResponse = await profile.save();


                return res.status(200).json(profileResponse);
               }
            }

        }

    }

    return res.status(400).json({ msg: 'Error while Creating Order'});
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){

 
        const profile = await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }

    }

    return res.status(400).json({ msg: 'Orders not found'});
}


export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    
    
    if(orderId){

 
        const order = await Customer.findById(orderId).populate("items.food");
        
        if(order){
            return res.status(200).json(order);
        }

    }

    return res.status(400).json({ msg: 'Order not found'});
}


