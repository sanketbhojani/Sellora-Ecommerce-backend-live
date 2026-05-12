import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from 'dotenv';
env.config();

import { Admin } from './models/Admin.js';
import { Seller } from './models/Seller.js';
import { Customer } from './models/Customer.js';
import { Category } from './models/Category.js';
import { Subcategory } from './models/Subcategory.js';
import { Product } from './models/Product.js';
import { Cart } from './models/Cart.js';
import { Wishlist } from './models/Wishlist.js';
import { Order } from './models/Order.js';
import { Payment } from './models/Payment.js';
import { Address } from './models/Address.js';
import { Review } from './models/Review.js';
import { Coupon } from './models/Coupon.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sellora_ecommerce';

// ─── Sample product images (royalty-free placeholder URLs) ────
const IMG = {
  // Men's Fashion
  menShirt: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
  menTshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  menJeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
  menJacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  menSneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  menWatch: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80',
  menPolo: 'https://images.unsplash.com/photo-1625910513413-5fc68e7990a7?w=500&q=80',
  // Women's Fashion
  womenDress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
  womenKurti: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80',
  womenSaree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  womenHeels: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
  womenBag: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  womenTop: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&q=80',
  womenJewelry: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=500&q=80',
  // Electronics
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&q=80',
  speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
  tablet: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80',
  // Home & Kitchen
  sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
  lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80',
  cookware: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
  bedsheet: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80',
  cushion: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80',
  wall: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80',
  // Beauty & Health
  skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80',
  makeup: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
  haircare: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500&q=80',
  lipstick: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80',
  sunscreen: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80',
  // Kids & Baby
  kidsToy: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&q=80',
  kidsClothes: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80',
  babyShoe: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80',
  babyBottle: 'https://images.unsplash.com/photo-1584839404210-260c06c59394?w=500&q=80',
  kidsBackpack: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80',
  // Categories
  catMen: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=500&q=80',
  catWomen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
  catElectronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&q=80',
  catHome: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80',
  catBeauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
  catKids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80',
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // ─── Clear existing data ──────────────────────────────────
    await Product.deleteMany({});
    await Subcategory.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Address.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared products, subcategories, categories, carts, wishlists, orders, payments, addresses, reviews, and coupons\n');

    // ─── CREATE ADMIN ────────────────────────────────────────
    let admin = await Admin.findOne({ email: 'admin@sellora.com' });
    if (!admin) {
      admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@sellora.com',
        password: await bcrypt.hash('Admin@123', 10),
        phone: '9999900000',
        isSuperAdmin: true,
        isVerified: true,
        isActive: true,
      });
      console.log('👑 Admin created: admin@sellora.com / Admin@123');
    } else {
      console.log('👑 Admin already exists');
    }

    // ─── CREATE SELLERS ──────────────────────────────────────
    let seller1 = await Seller.findOne({ email: 'seller1@sellora.com' });
    if (!seller1) {
      seller1 = await Seller.create({
        name: 'Rajesh Fashion House',
        email: 'seller1@sellora.com',
        password: await bcrypt.hash('Seller@123', 10),
        phone: '9888800001',
        shopName: 'Rajesh Fashion House',
        shopDescription: 'Premium fashion & lifestyle store',
        isVerified: true,
        isApproved: true,
        isActive: true,
      });
      console.log('🏪 Seller 1 created: seller1@sellora.com / Seller@123');
    }

    let seller2 = await Seller.findOne({ email: 'seller2@sellora.com' });
    if (!seller2) {
      seller2 = await Seller.create({
        name: 'TechZone Electronics',
        email: 'seller2@sellora.com',
        password: await bcrypt.hash('Seller@123', 10),
        phone: '9888800002',
        shopName: 'TechZone Electronics',
        shopDescription: 'Your one-stop shop for latest electronics',
        isVerified: true,
        isApproved: true,
        isActive: true,
      });
      console.log('🏪 Seller 2 created: seller2@sellora.com / Seller@123');
    }

    // ─── CREATE CUSTOMER ─────────────────────────────────────
    let customer = await Customer.findOne({ email: 'customer@sellora.com' });
    if (!customer) {
      customer = await Customer.create({
        name: 'Test Customer',
        email: 'customer@sellora.com',
        password: await bcrypt.hash('Customer@123', 10),
        phone: '9777700001',
        isVerified: true,
        isActive: true,
      });
      console.log('👤 Customer created: customer@sellora.com / Customer@123');
    }

    console.log('');

    // ─── CREATE CATEGORIES ───────────────────────────────────
    const categoriesData = [
      { name: "Men's Fashion", slug: "mens-fashion", image: IMG.catMen },
      { name: "Women's Fashion", slug: "womens-fashion", image: IMG.catWomen },
      { name: "Electronics", slug: "electronics", image: IMG.catElectronics },
      { name: "Home & Kitchen", slug: "home-kitchen", image: IMG.catHome },
      { name: "Beauty & Health", slug: "beauty-health", image: IMG.catBeauty },
      { name: "Kids & Baby", slug: "kids-baby", image: IMG.catKids },
    ];

    const categories = {};
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      categories[cat.slug] = created;
      console.log(`📁 Category: ${cat.name}`);
    }
    console.log('');

    // ─── CREATE SUBCATEGORIES ────────────────────────────────
    const subcategoriesData = [
      // Men's Fashion
      { name: "T-Shirts", slug: "t-shirts", category: categories["mens-fashion"]._id, image: IMG.menTshirt },
      { name: "Shirts", slug: "shirts", category: categories["mens-fashion"]._id, image: IMG.menShirt },
      { name: "Jeans & Trousers", slug: "jeans-trousers", category: categories["mens-fashion"]._id, image: IMG.menJeans },
      // Women's Fashion
      { name: "Dresses", slug: "dresses", category: categories["womens-fashion"]._id, image: IMG.womenDress },
      { name: "Kurtis & Sarees", slug: "kurtis-sarees", category: categories["womens-fashion"]._id, image: IMG.womenKurti },
      { name: "Handbags & Accessories", slug: "handbags-accessories", category: categories["womens-fashion"]._id, image: IMG.womenBag },
      // Electronics
      { name: "Smartphones", slug: "smartphones", category: categories["electronics"]._id, image: IMG.phone },
      { name: "Laptops & Tablets", slug: "laptops-tablets", category: categories["electronics"]._id, image: IMG.laptop },
      { name: "Audio & Wearables", slug: "audio-wearables", category: categories["electronics"]._id, image: IMG.headphones },
      // Home & Kitchen
      { name: "Furniture", slug: "furniture", category: categories["home-kitchen"]._id, image: IMG.sofa },
      { name: "Cookware", slug: "cookware", category: categories["home-kitchen"]._id, image: IMG.cookware },
      { name: "Home Decor", slug: "home-decor", category: categories["home-kitchen"]._id, image: IMG.lamp },
      // Beauty & Health
      { name: "Skincare", slug: "skincare", category: categories["beauty-health"]._id, image: IMG.skincare },
      { name: "Makeup", slug: "makeup", category: categories["beauty-health"]._id, image: IMG.makeup },
      { name: "Fragrances", slug: "fragrances", category: categories["beauty-health"]._id, image: IMG.perfume },
      // Kids & Baby
      { name: "Kids Clothing", slug: "kids-clothing", category: categories["kids-baby"]._id, image: IMG.kidsClothes },
      { name: "Toys & Games", slug: "toys-games", category: categories["kids-baby"]._id, image: IMG.kidsToy },
      { name: "Baby Care", slug: "baby-care", category: categories["kids-baby"]._id, image: IMG.babyBottle },
    ];

    const subcategories = {};
    for (const sub of subcategoriesData) {
      const created = await Subcategory.create(sub);
      subcategories[sub.slug] = created;
      console.log(`  📂 Subcategory: ${sub.name}`);
    }
    console.log('');

    // ─── CREATE PRODUCTS ─────────────────────────────────────
    const s1 = seller1._id;
    const s2 = seller2._id;

    const productsData = [
      // ── Men's T-Shirts ──
      { name: "Classic Cotton Crew Neck T-Shirt", description: "Premium 100% combed cotton crew neck t-shirt with reinforced stitching. Perfect for everyday casual wear. Available in multiple colors. Pre-shrunk fabric ensures lasting fit wash after wash.", price: 499, originalPrice: 999, images: [IMG.menTshirt], category: categories["mens-fashion"]._id, subcategory: subcategories["t-shirts"]._id, stock: 150, rating: 4.3, numReviews: 89, seller: s1, tags: ["cotton", "casual", "everyday"] },
      { name: "Graphic Print Urban T-Shirt", description: "Trendy graphic printed t-shirt with modern urban designs. Made from breathable cotton-polyester blend. Vibrant prints that won't fade. Street style meets comfort.", price: 599, originalPrice: 1299, images: [IMG.menTshirt], category: categories["mens-fashion"]._id, subcategory: subcategories["t-shirts"]._id, stock: 80, rating: 4.1, numReviews: 45, seller: s1, tags: ["graphic", "urban", "trendy"] },
      // ── Men's Shirts ──
      { name: "Slim Fit Oxford Button-Down Shirt", description: "Sophisticated Oxford button-down shirt in classic slim fit. Wrinkle-resistant fabric. Perfect for office or smart casual occasions. Premium mother-of-pearl buttons.", price: 1299, originalPrice: 2499, images: [IMG.menShirt], category: categories["mens-fashion"]._id, subcategory: subcategories["shirts"]._id, stock: 60, rating: 4.5, numReviews: 120, seller: s1, tags: ["formal", "slim-fit", "office"] },
      { name: "Casual Linen Summer Shirt", description: "Lightweight linen shirt perfect for summer. Breathable fabric keeps you cool. Relaxed fit with rolled-up sleeve tabs. Available in pastel shades.", price: 899, originalPrice: 1799, images: [IMG.menShirt], category: categories["mens-fashion"]._id, subcategory: subcategories["shirts"]._id, stock: 45, rating: 4.2, numReviews: 67, seller: s1, tags: ["linen", "summer", "casual"] },
      // ── Men's Jeans ──
      { name: "Slim Fit Stretch Denim Jeans", description: "Modern slim fit jeans with 2% elastane for comfortable stretch. Dark wash indigo color. Premium YKK zipper and riveted pockets. Classic 5-pocket styling.", price: 1499, originalPrice: 2999, images: [IMG.menJeans], category: categories["mens-fashion"]._id, subcategory: subcategories["jeans-trousers"]._id, stock: 90, rating: 4.6, numReviews: 200, seller: s1, tags: ["denim", "slim-fit", "stretch"] },
      { name: "Premium Chino Trousers", description: "Tailored chino trousers in premium cotton twill. Versatile enough for work and weekend. Flat front design with side pockets. Machine washable.", price: 999, originalPrice: 1999, images: [IMG.menJeans], category: categories["mens-fashion"]._id, subcategory: subcategories["jeans-trousers"]._id, stock: 70, rating: 4.4, numReviews: 88, seller: s1, tags: ["chinos", "formal", "workwear"] },

      // ── Women's Dresses ──
      { name: "Floral Maxi Wrap Dress", description: "Stunning floral maxi wrap dress with adjustable tie waist. Flowy georgette fabric that moves beautifully. Perfect for brunches, parties, and date nights. Lined for comfort.", price: 1799, originalPrice: 3599, images: [IMG.womenDress], category: categories["womens-fashion"]._id, subcategory: subcategories["dresses"]._id, stock: 40, rating: 4.7, numReviews: 156, seller: s1, tags: ["floral", "maxi", "party"] },
      { name: "Elegant A-Line Midi Dress", description: "Classic A-line midi dress in solid colors. Flattering silhouette for all body types. Soft crepe fabric with hidden zip closure. Versatile for office to evening wear.", price: 1299, originalPrice: 2499, images: [IMG.womenDress], category: categories["womens-fashion"]._id, subcategory: subcategories["dresses"]._id, stock: 55, rating: 4.5, numReviews: 98, seller: s1, tags: ["elegant", "midi", "office"] },
      // ── Women's Kurtis & Sarees ──
      { name: "Embroidered Cotton Kurti Set", description: "Beautiful hand-embroidered cotton kurti with matching palazzo pants. Traditional chikankari embroidery. Comfortable A-line fit. Perfect for festivals and daily wear.", price: 899, originalPrice: 1699, images: [IMG.womenKurti], category: categories["womens-fashion"]._id, subcategory: subcategories["kurtis-sarees"]._id, stock: 100, rating: 4.4, numReviews: 210, seller: s1, tags: ["kurti", "cotton", "ethnic"] },
      { name: "Silk Banarasi Saree with Blouse", description: "Handwoven silk Banarasi saree with rich zari work. Comes with matching unstitched blouse piece. Perfect for weddings and special occasions. 6.3 meters with blouse.", price: 3499, originalPrice: 6999, images: [IMG.womenSaree], category: categories["womens-fashion"]._id, subcategory: subcategories["kurtis-sarees"]._id, stock: 25, rating: 4.8, numReviews: 75, seller: s1, tags: ["saree", "silk", "wedding"] },
      // ── Women's Accessories ──
      { name: "Leather Crossbody Sling Bag", description: "Genuine leather crossbody sling bag with adjustable strap. Multiple compartments for organized storage. Antique brass hardware. Compact yet spacious everyday bag.", price: 1599, originalPrice: 3199, images: [IMG.womenBag], category: categories["womens-fashion"]._id, subcategory: subcategories["handbags-accessories"]._id, stock: 35, rating: 4.3, numReviews: 64, seller: s1, tags: ["leather", "bag", "crossbody"] },
      { name: "Statement Pearl Jewelry Set", description: "Elegant faux pearl jewelry set including necklace, earrings, and bracelet. Gold-plated brass base. Hypoallergenic and tarnish-resistant. Beautiful gift box packaging.", price: 799, originalPrice: 1599, images: [IMG.womenJewelry], category: categories["womens-fashion"]._id, subcategory: subcategories["handbags-accessories"]._id, stock: 60, rating: 4.2, numReviews: 110, seller: s1, tags: ["jewelry", "pearl", "set"] },

      // ── Smartphones ──
      { name: "Galaxy Pro Max 5G Smartphone", description: "Flagship 5G smartphone with 6.7-inch AMOLED display, 108MP triple camera system, Snapdragon 8 Gen 3 processor. 12GB RAM, 256GB storage. All-day 5000mAh battery with 67W fast charging.", price: 24999, originalPrice: 34999, images: [IMG.phone], category: categories["electronics"]._id, subcategory: subcategories["smartphones"]._id, stock: 30, rating: 4.6, numReviews: 340, seller: s2, tags: ["5g", "smartphone", "flagship"] },
      { name: "Budget King 4G Smartphone", description: "Best-in-class budget smartphone. 6.5-inch HD+ display, 48MP AI camera, MediaTek Helio G85. 6GB RAM, 128GB expandable storage. Massive 6000mAh battery for 2-day usage.", price: 8999, originalPrice: 12999, images: [IMG.phone], category: categories["electronics"]._id, subcategory: subcategories["smartphones"]._id, stock: 100, rating: 4.2, numReviews: 560, seller: s2, tags: ["budget", "4g", "battery"] },
      // ── Laptops ──
      { name: "UltraBook Pro 14-inch Laptop", description: "Ultra-thin laptop with 14-inch 2.8K OLED display. Intel Core i7 13th Gen, 16GB RAM, 512GB SSD. Thunderbolt 4 ports. All-day battery life. Only 1.2kg weight.", price: 64999, originalPrice: 84999, images: [IMG.laptop], category: categories["electronics"]._id, subcategory: subcategories["laptops-tablets"]._id, stock: 15, rating: 4.7, numReviews: 89, seller: s2, tags: ["laptop", "ultrabook", "thin"] },
      { name: "Student Essential Laptop 15.6-inch", description: "Perfect laptop for students and everyday use. 15.6-inch Full HD display, AMD Ryzen 5, 8GB RAM, 256GB SSD. Pre-loaded with Windows 11. Anti-glare screen.", price: 34999, originalPrice: 44999, images: [IMG.laptop], category: categories["electronics"]._id, subcategory: subcategories["laptops-tablets"]._id, stock: 25, rating: 4.3, numReviews: 145, seller: s2, tags: ["laptop", "student", "budget"] },
      // ── Audio & Wearables ──
      { name: "Active Noise Cancelling Headphones", description: "Premium over-ear headphones with industry-leading ANC. 40mm custom drivers deliver rich, detailed sound. 35-hour battery life. Foldable design with premium carry case.", price: 4999, originalPrice: 8999, images: [IMG.headphones], category: categories["electronics"]._id, subcategory: subcategories["audio-wearables"]._id, stock: 50, rating: 4.5, numReviews: 230, seller: s2, tags: ["headphones", "anc", "wireless"] },
      { name: "True Wireless Earbuds Pro", description: "Premium TWS earbuds with active noise cancellation. 12mm drivers, Bluetooth 5.3, 32-hour total battery with case. IPX5 water resistant. Crystal clear call quality with 6 mics.", price: 2999, originalPrice: 5999, images: [IMG.earbuds], category: categories["electronics"]._id, subcategory: subcategories["audio-wearables"]._id, stock: 80, rating: 4.4, numReviews: 410, seller: s2, tags: ["earbuds", "tws", "wireless"] },
      { name: "SmartFit Pro Fitness Watch", description: "Advanced fitness smartwatch with AMOLED display. GPS tracking, SpO2, heart rate, sleep monitoring. 100+ sports modes. 14-day battery life. 5ATM water resistant.", price: 3499, originalPrice: 6999, images: [IMG.smartwatch], category: categories["electronics"]._id, subcategory: subcategories["audio-wearables"]._id, stock: 40, rating: 4.3, numReviews: 178, seller: s2, tags: ["smartwatch", "fitness", "gps"] },

      // ── Furniture ──
      { name: "Modern 3-Seater Fabric Sofa", description: "Contemporary 3-seater sofa with premium fabric upholstery. High-density foam cushions for excellent comfort. Solid wood frame. Easy assembly with included tools. Available in 4 colors.", price: 18999, originalPrice: 29999, images: [IMG.sofa], category: categories["home-kitchen"]._id, subcategory: subcategories["furniture"]._id, stock: 10, rating: 4.5, numReviews: 45, seller: s1, tags: ["sofa", "furniture", "living-room"] },
      // ── Cookware ──
      { name: "Non-Stick Cookware Set (5 Pieces)", description: "Premium non-stick cookware set including fry pan, saucepan, kadai, tawa, and dosa tawa. PFOA-free coating. Induction compatible. Soft-touch bakelite handles. Dishwasher safe.", price: 2499, originalPrice: 4999, images: [IMG.cookware], category: categories["home-kitchen"]._id, subcategory: subcategories["cookware"]._id, stock: 35, rating: 4.4, numReviews: 156, seller: s1, tags: ["cookware", "non-stick", "kitchen"] },
      // ── Home Decor ──
      { name: "Designer LED Table Lamp", description: "Modern minimalist LED table lamp with touch dimmer. 3 color temperature modes (warm, neutral, cool). USB charging port. Perfect for bedroom or study desk. Energy efficient.", price: 1299, originalPrice: 2499, images: [IMG.lamp], category: categories["home-kitchen"]._id, subcategory: subcategories["home-decor"]._id, stock: 60, rating: 4.3, numReviews: 88, seller: s1, tags: ["lamp", "led", "decor"] },
      { name: "Luxury Velvet Cushion Covers (Set of 5)", description: "Premium velvet cushion covers in jewel tones. 16x16 inch standard size. Hidden zip closure. Machine washable. Transform your living space instantly.", price: 699, originalPrice: 1399, images: [IMG.cushion], category: categories["home-kitchen"]._id, subcategory: subcategories["home-decor"]._id, stock: 80, rating: 4.1, numReviews: 200, seller: s1, tags: ["cushion", "velvet", "decor"] },

      // ── Skincare ──
      { name: "Vitamin C Brightening Serum", description: "Professional-grade 20% Vitamin C serum with Hyaluronic Acid and Vitamin E. Brightens skin, reduces dark spots, and boosts collagen production. 30ml glass dropper bottle. Dermatologically tested.", price: 599, originalPrice: 1199, images: [IMG.skincare], category: categories["beauty-health"]._id, subcategory: subcategories["skincare"]._id, stock: 120, rating: 4.5, numReviews: 450, seller: s1, tags: ["skincare", "vitamin-c", "serum"] },
      { name: "SPF 50+ Sunscreen Gel", description: "Lightweight, non-greasy SPF 50+ PA++++ sunscreen gel. Broad spectrum UVA/UVB protection. Water-resistant formula. No white cast. Suitable for all skin types. 50g tube.", price: 399, originalPrice: 699, images: [IMG.sunscreen], category: categories["beauty-health"]._id, subcategory: subcategories["skincare"]._id, stock: 200, rating: 4.6, numReviews: 670, seller: s1, tags: ["sunscreen", "spf50", "gel"] },
      // ── Makeup ──
      { name: "12-Shade Matte Eyeshadow Palette", description: "Professional 12-shade matte eyeshadow palette with mirror. Highly pigmented, blendable formula. Mix of neutrals, earth tones, and bold shades. Long-lasting wear up to 16 hours.", price: 799, originalPrice: 1599, images: [IMG.makeup], category: categories["beauty-health"]._id, subcategory: subcategories["makeup"]._id, stock: 70, rating: 4.3, numReviews: 189, seller: s1, tags: ["makeup", "eyeshadow", "palette"] },
      { name: "Velvet Matte Lipstick Set (6 Shades)", description: "Set of 6 gorgeous velvet matte lipsticks in curated shades from nude to bold red. Creamy, non-drying formula with Vitamin E. Transfer-proof for up to 12 hours.", price: 899, originalPrice: 1799, images: [IMG.lipstick], category: categories["beauty-health"]._id, subcategory: subcategories["makeup"]._id, stock: 90, rating: 4.4, numReviews: 310, seller: s1, tags: ["lipstick", "matte", "set"] },
      // ── Fragrances ──
      { name: "Luxury Eau de Parfum - Midnight Oud", description: "Premium unisex fragrance with top notes of bergamot and saffron, heart of oud and rose, base of sandalwood and musk. Long-lasting 8+ hours. 100ml bottle.", price: 2499, originalPrice: 4999, images: [IMG.perfume], category: categories["beauty-health"]._id, subcategory: subcategories["fragrances"]._id, stock: 30, rating: 4.7, numReviews: 125, seller: s1, tags: ["perfume", "oud", "luxury"] },

      // ── Kids Clothing ──
      { name: "Kids Cotton T-Shirt Pack (3 Pieces)", description: "Fun graphic printed cotton t-shirts for kids aged 3-12 years. 100% breathable cotton. Colorfast prints that last. Available in multiple design combos.", price: 599, originalPrice: 1199, images: [IMG.kidsClothes], category: categories["kids-baby"]._id, subcategory: subcategories["kids-clothing"]._id, stock: 100, rating: 4.3, numReviews: 178, seller: s1, tags: ["kids", "cotton", "t-shirt"] },
      { name: "Girls Party Frock with Hair Band", description: "Beautiful party frock for girls aged 2-8 years. Soft net and satin fabric. Matching hair band included. Perfect for birthdays and celebrations. Hand wash recommended.", price: 799, originalPrice: 1599, images: [IMG.kidsClothes], category: categories["kids-baby"]._id, subcategory: subcategories["kids-clothing"]._id, stock: 50, rating: 4.5, numReviews: 95, seller: s1, tags: ["girls", "frock", "party"] },
      // ── Toys ──
      { name: "Educational Building Blocks (250 Pieces)", description: "Creative building blocks set with 250 colorful pieces. BPA-free ABS plastic. Develops motor skills and creativity. Compatible with major brands. Ages 3+. Storage bucket included.", price: 999, originalPrice: 1999, images: [IMG.kidsToy], category: categories["kids-baby"]._id, subcategory: subcategories["toys-games"]._id, stock: 60, rating: 4.6, numReviews: 220, seller: s2, tags: ["toys", "blocks", "educational"] },
      { name: "Remote Control Racing Car", description: "High-speed RC racing car with 2.4GHz remote control. 4WD drive with shock absorbers. USB rechargeable battery. Working LED headlights. Range up to 50 meters.", price: 1499, originalPrice: 2999, images: [IMG.kidsToy], category: categories["kids-baby"]._id, subcategory: subcategories["toys-games"]._id, stock: 40, rating: 4.2, numReviews: 134, seller: s2, tags: ["rc-car", "toys", "racing"] },
      // ── Baby Care ──
      { name: "Baby Care Essentials Gift Set", description: "Complete baby care gift set with baby lotion, shampoo, powder, oil, and wipes. Dermatologically tested, tear-free formula. Paraben and sulfate free. Perfect for newborns.", price: 699, originalPrice: 1299, images: [IMG.babyBottle], category: categories["kids-baby"]._id, subcategory: subcategories["baby-care"]._id, stock: 70, rating: 4.4, numReviews: 167, seller: s1, tags: ["baby", "care", "gift-set"] },
    ];

    let productCount = 0;
    for (const prod of productsData) {
      await Product.create(prod);
      productCount++;
    }
    console.log(`\n🛍️  Created ${productCount} products`);

    // Update seller totalProducts
    const s1Count = await Product.countDocuments({ seller: s1 });
    const s2Count = await Product.countDocuments({ seller: s2 });
    await Seller.findByIdAndUpdate(s1, { totalProducts: s1Count });
    await Seller.findByIdAndUpdate(s2, { totalProducts: s2Count });

    console.log(`\n✅ Seed completed successfully!`);
    console.log('\n─────────────────────────────────────');
    console.log('📋 Test Accounts:');
    console.log('  👑 Admin:    admin@sellora.com    / Admin@123');
    console.log('  🏪 Seller1:  seller1@sellora.com  / Seller@123');
    console.log('  🏪 Seller2:  seller2@sellora.com  / Seller@123');
    console.log('  👤 Customer: customer@sellora.com / Customer@123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
