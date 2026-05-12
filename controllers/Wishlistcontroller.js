import mongoose from "mongoose";
import { Wishlist } from '../models/Wishlist.js'
import { Product } from "../models/Product.js";

const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: "products",
                match: { isActive: true }, 
                select: "name images price originalPrice rating numReviews stock category subcategory",
                populate: [
                    { path: "category", select: "name slug" },
                    { path: "subcategory", select: "name slug" },
                ],
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: {
                    total: 0,
                    products: [],
                },
                message: "Wishlist is empty",
            });
        }
        
        const activeProducts = wishlist.products.filter(Boolean);
        return res.status(200).json({
            success: true,
            data: {
                total: activeProducts.length,
                products: activeProducts,
            },
            message: "Wishlist fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                products: [],
            });
        }

        // ✅ Cleanup invalid/deleted products while we're at it
        const validProducts = await Product.find({ _id: { $in: wishlist.products } }).select('_id');
        const validProductIds = validProducts.map(p => p._id.toString());
        wishlist.products = wishlist.products.filter(id => validProductIds.includes(id.toString()));

        const alreadyInWishlist = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (alreadyInWishlist) {
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
            await wishlist.save();

            return res.status(200).json({
                success: true,
                isWishlisted: false,
                message: "Product removed from wishlist successfully",
            });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        return res.status(200).json({
            success: true,
            isWishlisted: true,
            message: "Product added to wishlist successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }


        const wishlist = await Wishlist.findOne({ user: req.user._id });

        const isWishlisted = wishlist
            ? wishlist.products.some((id) => id.toString() === productId)
            : false;

        return res.status(200).json({
            success: true,
            isWishlisted,
            message: isWishlisted
                ? "Product is in wishlist"
                : "Product is not in wishlist",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist || wishlist.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Wishlist is already empty",
            });
        }

        wishlist.products = [];
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export { getWishlist, toggleWishlist, checkWishlist,clearWishlist };