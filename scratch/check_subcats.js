import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  // Find all subcategories under Electronics
  const subcategories = await mongoose.connection.db.collection('subcategories').find({
    category: new mongoose.Types.ObjectId('6a0a9e50e6132408d4f9751d')
  }).toArray();
  
  console.log('Subcategories under Electronics:', JSON.stringify(subcategories, null, 2));
  
  // Also see if any subcategories in general are inactive
  const inactiveSubcategories = await mongoose.connection.db.collection('subcategories').find({
    isActive: false
  }).toArray();
  console.log('All Inactive Subcategories in DB:', JSON.stringify(inactiveSubcategories, null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
