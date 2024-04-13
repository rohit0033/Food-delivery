 
import mongoose from 'mongoose'; 
import { MONGO_URL } from '../config';

export default async() => {

    try {
        const conn = await mongoose.connect(MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}
  
  
 