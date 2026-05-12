import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import env from 'dotenv';
env.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce';

async function verify() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');
        
        // Set delivery date to 10 days ago
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        
        const result = await Order.updateOne({}, { 
            $set: { 
                orderStatus: 'delivered',
                deliveredAt: tenDaysAgo
            } 
        });
        console.log('Update result (10 days ago):', result);
        
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
