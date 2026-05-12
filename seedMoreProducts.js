
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Subcategory } from './models/Subcategory.js';
import { Seller } from './models/Seller.js';

dotenv.config();

const seedMoreProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce');
    console.log('Connected to MongoDB for more seeding...');

    // Find Categories
    const homeCat = await Category.findOne({ name: "Home & Kitchen" });
    const beautyCat = await Category.findOne({ name: "Beauty & Health" });
    const electronicsCat = await Category.findOne({ name: "Electronics" });
    const womenFashionCat = await Category.findOne({ name: "Women's Fashion" });
    const kidsCat = await Category.findOne({ name: "Kids & Baby" });

    // Find Subcategories
    const furnitureSub = await Subcategory.findOne({ name: "Furniture" });
    const cookwareSub = await Subcategory.findOne({ name: "Cookware" });
    const homeDecorSub = await Subcategory.findOne({ name: "Home Decor" });
    const skincareSub = await Subcategory.findOne({ name: "Skincare" });
    const makeupSub = await Subcategory.findOne({ name: "Makeup" });
    const fragrancesSub = await Subcategory.findOne({ name: "Fragrances" });
    const audioSub = await Subcategory.findOne({ name: "Audio & Wearables" });
    const dressesSub = await Subcategory.findOne({ name: "Dresses" });
    const toysSub = await Subcategory.findOne({ name: "Toys & Games" });

    // Find Sellers
    const techSeller = await Seller.findOne({ shopName: "TechZone Electronics" });
    const fashionSeller = await Seller.findOne({ shopName: "Rajesh Fashion House" });
    const sanketSeller = await Seller.findOne({ shopName: "sanket" });

    if (!homeCat || !beautyCat || !sanketSeller) {
      console.error('Required categories or sellers not found.');
      process.exit(1);
    }

    const products = [
      {
        name: "Sony WH-1000XM5 Wireless Headphones",
        description: "Our best noise canceling ever gets even better. Specially developed by Sony, the Integrated Processor V1 unlocks the full potential of our HD Noise Canceling Processor QN1.",
        price: 26990,
        originalPrice: 34990,
        images: [
          "https://images.unsplash.com/photo-1675243938563-34606611f788?w=800&q=80",
          "https://images.unsplash.com/photo-1618366712277-7216461b945b?w=800&q=80",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
        ],
        category: electronicsCat._id,
        subcategory: audioSub._id,
        stock: 40,
        seller: techSeller._id,
        tags: ["sony", "headphones", "audio", "noise-canceling"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Philips Digital Air Fryer HD9252/90",
        description: "Great tasting fries with up to 90% less fat, thanks to Rapid Air technology! Philips brings the World's No.1 Airfryer to everyone's home.",
        price: 8499,
        originalPrice: 11995,
        images: [
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
          "https://images.unsplash.com/photo-1632733711679-5292d6863670?w=800&q=80",
          "https://images.unsplash.com/photo-1584281729155-b1a9cb3dd15d?w=800&q=80",
          "https://m.media-amazon.com/images/I/618SST6S2yL._SL1500_.jpg"
        ],
        category: homeCat._id,
        subcategory: cookwareSub._id,
        stock: 60,
        seller: sanketSeller._id,
        tags: ["philips", "cookware", "kitchen", "healthy"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Chanel No. 5 Eau De Parfum",
        description: "The essence of femininity. A powdery floral bouquet housed in an iconic bottle with a minimalist design. A timeless, legendary fragrance.",
        price: 14500,
        originalPrice: 16000,
        images: [
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
          "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
          "https://images.unsplash.com/photo-1563170351-be39c88ea281?w=800&q=80",
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"
        ],
        category: beautyCat._id,
        subcategory: fragrancesSub._id,
        stock: 30,
        seller: sanketSeller._id,
        tags: ["chanel", "fragrance", "luxury", "women"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "NIVEA Soft Light Moisturizer",
        description: "Enjoy the refreshing feeling of NIVEA Soft. With Vitamin E and Jojoba Oil, it is quickly absorbed and refreshes the skin.",
        price: 499,
        originalPrice: 599,
        images: [
          "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80",
          "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80",
          "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
        ],
        category: beautyCat._id,
        subcategory: skincareSub._id,
        stock: 200,
        seller: sanketSeller._id,
        tags: ["nivea", "skincare", "moisturizer", "beauty"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "L'Oreal Paris Rouge Lipstick",
        description: "Indulge in intense hydration and rich color. L'Oreal Paris Color Riche Intense Volume Matte Lipstick offers up to 16H wear.",
        price: 899,
        originalPrice: 999,
        images: [
          "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800&q=80",
          "https://images.unsplash.com/photo-1625093742435-6fa192c6df10?w=800&q=80",
          "https://images.unsplash.com/photo-1591360236630-449db48d1ec9?w=800&q=80",
          "https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=800&q=80"
        ],
        category: beautyCat._id,
        subcategory: makeupSub._id,
        stock: 150,
        seller: sanketSeller._id,
        tags: ["loreal", "makeup", "lipstick", "beauty"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "LEGO Star Wars Darth Vader Helmet",
        description: "Pay homage to the Dark Lord of the Sith with this collectible LEGO Star Wars Darth Vader Helmet (75304) build-and-display model.",
        price: 7999,
        originalPrice: 8999,
        images: [
          "https://images.unsplash.com/photo-1585366119957-eef73f3000df?w=800&q=80",
          "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80",
          "https://images.unsplash.com/photo-1531693855900-349c07ec7624?w=800&q=80",
          "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&q=80"
        ],
        category: kidsCat._id,
        subcategory: toysSub._id,
        stock: 15,
        seller: sanketSeller._id,
        tags: ["lego", "starwars", "toys", "kids"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "IKEA Stockholm Mirror",
        description: "The streamlined shape and the walnut veneer give each mirror a unique and high-quality expression. A classic that works in many rooms.",
        price: 4500,
        originalPrice: 5000,
        images: [
          "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
          "https://images.unsplash.com/photo-1594913203245-c6c8c3bb4853?w=800&q=80"
        ],
        category: homeCat._id,
        subcategory: homeDecorSub._id,
        stock: 25,
        seller: sanketSeller._id,
        tags: ["ikea", "mirror", "decor", "home"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Vintage Velvet Armchair",
        description: "A luxury velvet armchair that brings a touch of elegance to any living space. Solid wood frame and premium upholstery.",
        price: 24999,
        originalPrice: 29999,
        images: [
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80"
        ],
        category: homeCat._id,
        subcategory: furnitureSub._id,
        stock: 10,
        seller: sanketSeller._id,
        tags: ["furniture", "chair", "luxury", "living-room"],
        isApproved: true,
        approvalStatus: "approved"
      },
      {
        name: "Zara Floral Summer Dress",
        description: "Lightweight and airy floral dress, perfect for garden parties and beach strolls. Featuring a delicate print and a smooth silhouette.",
        price: 3999,
        originalPrice: 4999,
        images: [
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
          "https://images.unsplash.com/photo-1515377666659-0050e68f804e?w=800&q=80",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
          "https://images.unsplash.com/photo-1539109136881-3be061694b9b?w=800&q=80"
        ],
        category: womenFashionCat._id,
        subcategory: dressesSub._id,
        stock: 100,
        seller: fashionSeller._id,
        tags: ["zara", "fashion", "dress", "women"],
        isApproved: true,
        approvalStatus: "approved"
      }
    ];

    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} more varied products!`);

    // Update seller product counts
    await Seller.findByIdAndUpdate(sanketSeller._id, { $inc: { totalProducts: 7 } });
    await Seller.findByIdAndUpdate(fashionSeller._id, { $inc: { totalProducts: 1 } });
    await Seller.findByIdAndUpdate(techSeller._id, { $inc: { totalProducts: 1 } });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedMoreProducts();
