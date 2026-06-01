import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  // Fetch some products and see their category/subcategory
  const products = await mongoose.connection.db.collection('products').find({}).limit(10).toArray();
  
  console.log('--- PRODUCTS IN DB ---');
  console.log(JSON.stringify(products.map(p => ({
    name: p.name,
    category: p.category,
    subcategory: p.subcategory
  })), null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
