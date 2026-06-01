import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  // Find "Electronics" category and update isActive to true
  const result = await mongoose.connection.db.collection('categories').updateOne(
    { name: "Electronics" },
    { $set: { isActive: true } }
  );
  
  console.log('Update result:', result);
  
  const updated = await mongoose.connection.db.collection('categories').findOne({ name: "Electronics" });
  console.log('Updated category:', updated);
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
