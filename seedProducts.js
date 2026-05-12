
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Subcategory } from './models/Subcategory.js';
import { Seller } from './models/Seller.js';

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce');
    console.log('Connected to MongoDB for seeding...');

    // Find Categories and Subcategories
    const fashionCat = await Category.findOne({ name: "Men's Fashion" });
    const electronicsCat = await Category.findOne({ name: "Electronics" });
    
    const tshirtsSub = await Subcategory.findOne({ name: "T-Shirts" });
    const phonesSub = await Subcategory.findOne({ name: "Smartphones" });
    const laptopsSub = await Subcategory.findOne({ name: "Laptops & Tablets" });

    // Find Sellers
    const fashionSeller = await Seller.findOne({ shopName: "Rajesh Fashion House" });
    const techSeller = await Seller.findOne({ shopName: "TechZone Electronics" });

    if (!fashionCat || !electronicsCat || !fashionSeller || !techSeller) {
      console.error('Required categories or sellers not found. Please ensure they exist.');
      process.exit(1);
    }

    const products = [
      {
        name: "Nike Air Max 270",
        description: "The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it nods to the original 180 with its exaggerated tongue top and heritage tongue logo.",
        price: 12995,
        originalPrice: 14995,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80"
        ],
        category: fashionCat._id,
        subcategory: tshirtsSub._id, // Using t-shirts as placeholder if shoes subcat missing
        stock: 50,
        seller: fashionSeller._id,
        tags: ["nike", "shoes", "sneakers", "sports"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Adidas Ultraboost Light",
        description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST.",
        price: 18999,
        originalPrice: 19999,
        images: [
          "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80",
          "https://images.unsplash.com/photo-1620794341491-76be6eeb6946?w=800&q=80",
          "https://images.unsplash.com/photo-1512374382149-4332c6c02151?w=800&q=80",
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80"
        ],
        category: fashionCat._id,
        subcategory: tshirtsSub._id,
        stock: 35,
        seller: fashionSeller._id,
        tags: ["adidas", "shoes", "running", "sports"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "iPhone 15 Pro Max",
        description: "Titanium design. A17 Pro chip. A customizable Action button. And the most powerful iPhone camera system ever.",
        price: 159900,
        originalPrice: 159900,
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
          "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80",
          "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80",
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80"
        ],
        category: electronicsCat._id,
        subcategory: phonesSub._id,
        stock: 20,
        seller: techSeller._id,
        tags: ["apple", "iphone", "smartphone", "ios"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "MacBook Air M2",
        description: "Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency within its durable all-aluminum enclosure.",
        price: 114900,
        originalPrice: 119900,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
          "https://images.unsplash.com/photo-1611186871348-b1ec696e523b?w=800&q=80",
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"
        ],
        category: electronicsCat._id,
        subcategory: laptopsSub._id,
        stock: 15,
        seller: techSeller._id,
        tags: ["apple", "macbook", "laptop", "m2"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Samsung Galaxy S23 Ultra",
        description: "Samsung's ultimate smartphone with S Pen, 200MP camera, and astounding night photography. The world's fastest mobile processor.",
        price: 124999,
        originalPrice: 149999,
        images: [
          "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80",
          "https://images.unsplash.com/photo-1677157953092-2fdbaeb445a4?w=800&q=80",
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80"
        ],
        category: electronicsCat._id,
        subcategory: phonesSub._id,
        stock: 25,
        seller: techSeller._id,
        tags: ["samsung", "galaxy", "smartphone", "android"],
        isApproved: true,
        approvalStatus: "approved"
      }
    ];

    await Product.insertMany(products);
    console.log('Successfully seeded 5 premium products!');

    // Update seller product counts
    await Seller.findByIdAndUpdate(fashionSeller._id, { $inc: { totalProducts: 2 } });
    await Seller.findByIdAndUpdate(techSeller._id, { $inc: { totalProducts: 3 } });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
