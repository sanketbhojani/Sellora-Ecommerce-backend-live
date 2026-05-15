import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');

  // Find a seller from products to use for testing
  const orders = await Order.find().limit(10);
  console.log(`Found ${orders.length} orders`);
  
  if (orders.length > 0) {
    const firstOrder = orders[0];
    console.log('First Order ID:', firstOrder._id);
    console.log('Order Items Sellers:', firstOrder.orderItems.map(i => i.seller));
    
    const sellerId = firstOrder.orderItems[0].seller;
    console.log('Testing for Seller ID:', sellerId);

    const unread = await Order.find({
        "orderItems.seller": sellerId,
        seenBySellers: { $ne: sellerId }
    });
    console.log(`Unread orders for this seller: ${unread.length}`);
    
    // Check if seenBySellers exists
    console.log('seenBySellers field exists in first order:', firstOrder.seenBySellers !== undefined);
    console.log('seenBySellers value:', firstOrder.seenBySellers);
  }

  await mongoose.disconnect();
};

test();
