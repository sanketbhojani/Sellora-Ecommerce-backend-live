import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
  console.log('--- ALL CATEGORIES ---');
  console.log(JSON.stringify(categories, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
