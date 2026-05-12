import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import env from 'dotenv';
env.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce';

async function verify() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');
        
        const result = await Order.updateOne({}, { 
            $set: { 
                orderStatus: 'delivered',
                deliveredAt: new Date()
            } 
        });
        console.log('Update result:', result);
        
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
