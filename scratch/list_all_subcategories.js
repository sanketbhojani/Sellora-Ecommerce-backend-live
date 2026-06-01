import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  // Dump all subcategories from the database
  const subcategories = await mongoose.connection.db.collection('subcategories').find({}).toArray();
  
  console.log('--- ALL SUBCATEGORIES IN DB ---');
  console.log(JSON.stringify(subcategories, null, 2));
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
