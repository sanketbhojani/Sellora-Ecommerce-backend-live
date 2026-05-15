import mongoose from 'mongoose';
import { Seller } from './models/Seller.js';
import { Order } from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');

  const sellers = await Seller.find({}, 'name shopName _id');
  console.log('Sellers:', sellers.map(s => ({ name: s.name, shopName: s.shopName, id: s._id })));

  const orders = await Order.find({}, 'orderItems.seller _id').limit(10);
  console.log('Orders sample sellers:', orders.map(o => o.orderItems.map(i => i.seller)));

  await mongoose.disconnect();
};

test();
