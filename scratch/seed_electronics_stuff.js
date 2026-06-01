import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Subcategory } from '../models/Subcategory.js';
import { Product } from '../models/Product.js';
import { Seller } from '../models/Seller.js';

dotenv.config();

const IMG = {
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&q=80',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to database.');

  // 1. Get the current Electronics category
  const electronicsCat = await Category.findOne({ name: "Electronics" });
  if (!electronicsCat) {
    console.error('Electronics category not found. Make sure to run activate_electronics.js first.');
    process.exit(1);
  }
  console.log('Found Electronics Category:', electronicsCat._id);

  // 2. Find TechZone Electronics seller or any seller
  let seller = await Seller.findOne({ email: 'seller2@sellora.com' });
  if (!seller) {
    seller = await Seller.findOne({ shopName: /Electronics/i });
  }
  if (!seller) {
    seller = await Seller.findOne({});
  }
  if (!seller) {
    console.error('No seller found in the database. Please create a seller first.');
    process.exit(1);
  }
  console.log('Using Seller:', seller.name, 'with ID:', seller._id);

  // 3. Re-create Electronics Subcategories
  const subcatsToSeed = [
    { name: "Smartphones", slug: "smartphones", category: electronicsCat._id, image: IMG.phone, isActive: true },
    { name: "Laptops & Tablets", slug: "laptops-tablets", category: electronicsCat._id, image: IMG.laptop, isActive: true },
    { name: "Audio & Wearables", slug: "audio-wearables", category: electronicsCat._id, image: IMG.headphones, isActive: true }
  ];

  const subcategories = {};
  for (const sub of subcatsToSeed) {
    let existingSub = await Subcategory.findOne({ name: sub.name, category: electronicsCat._id });
    if (!existingSub) {
      existingSub = await Subcategory.create(sub);
      console.log(`Created Subcategory: ${sub.name}`);
    } else {
      existingSub.isActive = true;
      await existingSub.save();
      console.log(`Subcategory already existed, marked as active: ${sub.name}`);
    }
    subcategories[sub.slug] = existingSub;
  }

  // 4. Re-create Electronics Products
  const productsToSeed = [
    { 
      name: "Galaxy Pro Max 5G Smartphone", 
      description: "Flagship 5G smartphone with 6.7-inch AMOLED display, 108MP triple camera system, Snapdragon 8 Gen 3 processor. 12GB RAM, 256GB storage. All-day 5000mAh battery with 67W fast charging.", 
      price: 24999, 
      originalPrice: 34999, 
      images: [IMG.phone], 
      category: electronicsCat._id, 
      subcategory: subcategories["smartphones"]._id, 
      stock: 30, 
      rating: 4.6, 
      numReviews: 340, 
      seller: seller._id, 
      tags: ["5g", "smartphone", "flagship"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "Budget King 4G Smartphone", 
      description: "Best-in-class budget smartphone. 6.5-inch HD+ display, 48MP AI camera, MediaTek Helio G85. 6GB RAM, 128GB expandable storage. Massive 6000mAh battery for 2-day usage.", 
      price: 8999, 
      originalPrice: 12999, 
      images: [IMG.phone], 
      category: electronicsCat._id, 
      subcategory: subcategories["smartphones"]._id, 
      stock: 100, 
      rating: 4.2, 
      numReviews: 560, 
      seller: seller._id, 
      tags: ["budget", "4g", "battery"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "UltraBook Pro 14-inch Laptop", 
      description: "Ultra-thin laptop with 14-inch 2.8K OLED display. Intel Core i7 13th Gen, 16GB RAM, 512GB SSD. Thunderbolt 4 ports. All-day battery life. Only 1.2kg weight.", 
      price: 64999, 
      originalPrice: 84999, 
      images: [IMG.laptop], 
      category: electronicsCat._id, 
      subcategory: subcategories["laptops-tablets"]._id, 
      stock: 15, 
      rating: 4.7, 
      numReviews: 89, 
      seller: seller._id, 
      tags: ["laptop", "ultrabook", "thin"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "Student Essential Laptop 15.6-inch", 
      description: "Perfect laptop for students and everyday use. 15.6-inch Full HD display, AMD Ryzen 5, 8GB RAM, 256GB SSD. Pre-loaded with Windows 11. Anti-glare screen.", 
      price: 34999, 
      originalPrice: 44999, 
      images: [IMG.laptop], 
      category: electronicsCat._id, 
      subcategory: subcategories["laptops-tablets"]._id, 
      stock: 25, 
      rating: 4.3, 
      numReviews: 145, 
      seller: seller._id, 
      tags: ["laptop", "student", "budget"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "Active Noise Cancelling Headphones", 
      description: "Premium over-ear headphones with industry-leading ANC. 40mm custom drivers deliver rich, detailed sound. 35-hour battery life. Foldable design with premium carry case.", 
      price: 4999, 
      originalPrice: 8999, 
      images: [IMG.headphones], 
      category: electronicsCat._id, 
      subcategory: subcategories["audio-wearables"]._id, 
      stock: 50, 
      rating: 4.5, 
      numReviews: 230, 
      seller: seller._id, 
      tags: ["headphones", "anc", "wireless"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "True Wireless Earbuds Pro", 
      description: "Premium TWS earbuds with active noise cancellation. 12mm drivers, Bluetooth 5.3, 32-hour total battery with case. IPX5 water resistant. Crystal clear call quality with 6 mics.", 
      price: 2999, 
      originalPrice: 5999, 
      images: [IMG.earbuds], 
      category: electronicsCat._id, 
      subcategory: subcategories["audio-wearables"]._id, 
      stock: 80, 
      rating: 4.4, 
      numReviews: 410, 
      seller: seller._id, 
      tags: ["earbuds", "tws", "wireless"],
      isApproved: true,
      isActive: true
    },
    { 
      name: "SmartFit Pro Fitness Watch", 
      description: "Advanced fitness smartwatch with AMOLED display. GPS tracking, SpO2, heart rate, sleep monitoring. 100+ sports modes. 14-day battery life. 5ATM water resistant.", 
      price: 3499, 
      originalPrice: 6999, 
      images: [IMG.smartwatch], 
      category: electronicsCat._id, 
      subcategory: subcategories["audio-wearables"]._id, 
      stock: 40, 
      rating: 4.3, 
      numReviews: 178, 
      seller: seller._id, 
      tags: ["smartwatch", "fitness", "gps"],
      isApproved: true,
      isActive: true
    }
  ];

  let productsCount = 0;
  for (const prod of productsToSeed) {
    let existingProd = await Product.findOne({ name: prod.name, category: electronicsCat._id });
    if (!existingProd) {
      await Product.create(prod);
      console.log(`Created Product: ${prod.name}`);
      productsCount++;
    } else {
      existingProd.isActive = true;
      existingProd.isApproved = true;
      await existingProd.save();
      console.log(`Product already existed, marked as active: ${prod.name}`);
    }
  }

  // Update seller totalProducts
  const sellerProductCount = await Product.countDocuments({ seller: seller._id });
  seller.totalProducts = sellerProductCount;
  await seller.save();

  console.log(`\nSuccessfully seeded ${Object.keys(subcategories).length} subcategories and ${productsCount} products under Electronics!`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
