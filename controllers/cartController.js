import mongoose from "mongoose";
import { Cart } from '../models/Cart.js'
import { Product } from "../models/Product.js";

const recalculateCart = (cart) => {
    cart.totalItems = cart.items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    cart.totalPrice = cart.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
    }, 0);

    cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));
    return cart;
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: "items.product",
            match: { isActive: true },
            select: "name images price stock isActive category subcategory seller "
        });

        if (!cart) {
            return res.status(400).json({
                success: true,
                data: {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                },
                message: "Cart is empty"
            });

        }
        // ✅ Robust filter out inactive/deleted products
        cart.items = cart.items.filter((item) => item.product && item.product.isActive);
        
        // ✅ Sync cart item prices with latest product prices
        const priceChanges = [];
        let pricesUpdated = false;

        cart.items.forEach((item) => {
            if (item.product && item.product.price !== undefined) {
                const currentProductPrice = item.product.price;
                const storedCartPrice = item.price;

                if (storedCartPrice !== currentProductPrice) {
                    priceChanges.push({
                        productName: item.product.name,
                        oldPrice: storedCartPrice,
                        newPrice: currentProductPrice,
                    });
                    item.price = currentProductPrice;
                    pricesUpdated = true;
                }
            }
        });

        // Recalculate totals if any prices changed
        if (pricesUpdated) {
            recalculateCart(cart);
        }

        // Save cleaned/updated cart
        await cart.save();

        return res.status(200).json({
            success: true,
            data: cart,
            message: priceChanges.length > 0 
                ? "Some product prices have been updated by the seller" 
                : "Cart fetched successfully",
            priceChanges: priceChanges.length > 0 ? priceChanges : undefined,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }


}


const addToCart = async (req, res) => {
    try {

        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }


        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }


        // ✅ Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`,
            });
        }

        let cart = await Cart.findOne({user:req.user._id});
        if(!cart){
            cart = new Cart({
                user:req.user._id,
                items:[]
            });
        }


        // ✅ Check if product already in cart
        const existingItem = cart.items.find(
            (item) => item.product && item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // ✅ Check stock for updated quantity
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available. You already have ${existingItem.quantity} in cart`,
                });
            }
            existingItem.quantity = newQuantity;
            existingItem.price = product.price;  // ✅ Always sync to latest price
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
            });
        }
        
        recalculateCart(cart);
        await cart.save();

        await cart.populate({
            path:"items.product",
            select:"name images price stock",
        });

        return res.status(200).json({
            success: true,
            data: cart,
            message: existingItem ? "Product quantity updated in cart" : "Product added to cart successfully",
            isNewItem: !existingItem
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateCartItem  = async(req,res)=>{
    try {

        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

         if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        // ✅ Check product stock
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`,
            });
        }


        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }


        item.quantity = quantity;
        item.price = product.price;  //  refresh price on update

        recalculateCart(cart);
        await cart.save();

        await cart.populate({
            path: "items.product",
            select: "name images price stock",
        });

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Cart updated successfully",
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const removeFromCart  = async(req,res)=>{
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const itemExists = cart.items.some(
            (item) => item.product.toString() === productId
        );
        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        recalculateCart(cart);
        await cart.save();

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Product removed from cart successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const clearCart = async(req,res)=>{
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is already empty",
            });
        }
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export {
    getCart, addToCart,updateCartItem,removeFromCart,clearCart
}
