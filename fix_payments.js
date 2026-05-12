import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import { Payment } from './models/Payment.js';
import env from 'dotenv';
env.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce';

async function fix() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');
        
        const orders = await Order.find();
        console.log(`Checking ${orders.length} orders...`);
        
        for (const order of orders) {
            const payment = await Payment.findOne({ order: order._id });
            if (!payment) {
                console.log(`Creating missing payment for order ${order._id}`);
                const newPayment = new Payment({
                    order: order._id,
                    customer: order.customer,
                    amount: order.totalPrice,
                    currency: 'INR',
                    method: order.paymentMethod || 'online',
                    status: order.paymentStatus === 'refunded' ? 'refunded' : 'paid',
                    transactionId: `FIX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    paidAt: order.paidAt || order.createdAt,
                    note: 'System fixed payment record'
                });
                await newPayment.save();
            }
        }
        
        console.log('Finished fixing payments');
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
