import mongoose, { Schema, Document, Model } from 'mongoose';


export interface OrderDoc extends Document {

    orderId: string;
    vendorId: string;
    items: [any]; //{Food ,unit}
    totalAmount: number;
    orderDate: Date;
    paidThrough: string;
    paymentResponse: string;
    orderStatus: string; // To detemin the current status // Vendor can update the status like accpet , reject nall
    remarks:  String,
    deliveryId:  String,
    readyTime: Number,
    offerId: String,
    appliedOffers: boolean
}


const OrderSchema = new Schema({
    orderId: {type: String, required: true},
    vendorId: {type: String},
    items: [
        {
            food: {type: Schema.Types.ObjectId, ref: "food", required: true},
            unit: { type: Number, required: true}
        }
    ],
    totalAmount: {type: Number, required: true},
    orderDate: {type: Date },
    paidThrough: {type: String},
    paymentResponse: {type: String},
    orderStatus: {type: String},
    remarks: {type: String},
    deliveryId: {type: String},
    readyTime:{type: Number},
    appliedOffers: {type: Boolean},
    offerId: {type: String}
    
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});


const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export { Order }