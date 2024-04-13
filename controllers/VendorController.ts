import { Request, Response, NextFunction } from "express";
import {
    AuthpayLoad,
    CreateFoodInputs,
    EditVendorInput,
    VandorLoginInputs,
} from "../dto";
import { FindVendor } from "./AdminController";
import {
    GeneratePassword,
    GenerateSignature,
    ValidatePassword,
} from "../utility";
import { Food, Order } from "../models";

export const VandorLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = <VandorLoginInputs>req.body;
    const existingVendor = await FindVendor("", email);
    if (existingVendor != null) {
        const validation = await ValidatePassword(
            password,
            existingVendor.password,
            existingVendor.salt
        );
        if (validation) {
            const signature = GenerateSignature({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name,
            });
            return res.json({ token: signature });
        } else {
            return res.json({ message: "Passowrd is  Credentials not valid" });
        }
    }

    return res.json({ message: "Login Credentials not valid" });
};

export const GetVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (user && user._id) {
        console.log("user id ", user._id);

        const existingVendor = await FindVendor(user._id);
        return res.json(existingVendor);
    }

    return res.json({ message: "vendor Information Not Found" });
};

export const UpdateVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    const { foodType, name, address, phone } = <EditVendorInput>req.body;

    if (user && user._id) {
        const existingVendor = await FindVendor(user._id);

        if (existingVendor !== null) {
            existingVendor.name = name;
            existingVendor.address = address;
            existingVendor.phone = phone;
            if (foodType !== undefined && foodType !== null) {
                existingVendor.foodType = foodType;
            }
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
        }
    }
    return res.json({ message: "Unable to Update vendor profile " });
};

export const UpdateVandorCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    if (user) {
        const existingVendor = await FindVendor(user._id);
        if (existingVendor !== null) {
            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);
            existingVendor.coverImages.push(...images);
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
        }
    }
    return res.json({ message: "Something went while Updating Image " });
};

export const UpdateVendorService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    if (user) {
        const existingVendor = await FindVendor(user._id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            const saveResult = await existingVendor.save();
            return res.json(saveResult);
        }
    }
    return res.json({ message: "Unable to Update vendor service " });
};

export const AddFood = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    if (user) {
        if (!req.files) {
            return res.status(400).json({ message: "No files were uploaded." });
        }
        const files = req.files as [Express.Multer.File];

        const images = files.map((file: Express.Multer.File) => file.filename);
        const { name, description, category, foodType, readyTime, price } = <
            CreateFoodInputs
            >req.body;
        const existingVendor = await FindVendor(user._id);
        if (existingVendor !== null) {
            const createFood = await Food.create({
                vendorId: existingVendor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                readyTime: readyTime,
                price: price,
                rating: 0,
                images: images,
            });
            existingVendor.foods.push(createFood);
            const saveResult = await existingVendor.save();
            return res.json(saveResult);
        }
    }
    return res.json({ message: "Something went while adding food " });
};
export const GetFoods = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    if (user) {
        const foods = await Food.find({ vendorId: user._id });
        if (foods !== null) {
            return res.json(foods);
        }
    }
    return res.json({ message: "Food information not found " });
};

// To handle Order functionality

export const GetCurrentOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (user) {
        console.log(user._id);
        const orders = await Order.find({ vendorId: user._id }).populate(
            "items.food"
        );
        

        if (orders != null) {
            return res.status(200).json(orders);
        }
    }

    return res.json({ message: "Orders Not found" });
};

export const GetOrderDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const orderId = req.params.id;

    if (orderId) {
        const order = await Order.findById(orderId).populate("items.food");

        if (order != null) {
            return res.status(200).json(order);
        }
    }

    return res.json({ message: "Order Not found" });
};
export const ProcessOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const orderId = req.params.id;

    const { status, remarks, time } = req.body;

    const order = await Order.findById(orderId).populate('items.food');
    if (order) {
        order.orderStatus = status;
        order.remarks = remarks;
        if (time) {
            order.readyTime = time;
        }

        const orderResult = await order.save();

        if (orderResult != null) {
            return res.status(200).json(orderResult);
        }
    }

    return res.json({ message: "Unable to process order" });
};
