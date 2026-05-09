"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { userContext } from "@/context/userContext";
import { cartService } from "@/services/cartService";

export interface CartItem {
	_id: string;
	title: string;
	price: number;
	comparePrice?: number;
	currency: string;
	thumbnail?: string;
	category: string;
	slug: string;
}

interface CartContextType {
	cart: CartItem[];
	addToCart: (item: CartItem) => void;
	removeFromCart: (productId: string) => void;
	clearCart: () => void;
	isInCart: (productId: string) => boolean;
	getCartTotal: () => number;
	itemCount: number;
	loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const { user } = userContext();
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [loading, setLoading] = useState(false);

	// Sync local storage cart to server if user just logged in
	const syncWithServer = useCallback(async (localItems: CartItem[]) => {
		if (!user) return;
		try {
			setLoading(true);
            const serverCart = await cartService.getCart(user._id);
            const mergedItems = [...serverCart.items];
            
            // Add local items that aren't on server
            localItems.forEach(localItem => {
                if (!mergedItems.some(item => item._id === localItem._id)) {
                    mergedItems.push(localItem);
                }
            });

            await cartService.updateCart(user._id, { items: mergedItems });
            setCart(mergedItems);
		} catch (error) {
			console.error("Cart sync error:", error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	// Fetch cart from server
	const fetchCart = useCallback(async () => {
		if (!user) return;
		try {
			setLoading(true);
            const data = await cartService.getCart(user._id);
            setCart(data.items || []);
		} catch (error) {
			console.error("Fetch cart error:", error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	// Initial load
	useEffect(() => {
		const savedCart = localStorage.getItem("deelzo_cart");
		let localItems: CartItem[] = [];
		if (savedCart) {
			try {
				localItems = JSON.parse(savedCart);
				setCart(localItems);
			} catch (e) {
				console.error("Failed to parse cart", e);
			}
		}
		
		if (user) {
			syncWithServer(localItems);
		}
		setIsInitialized(true);
	}, [user, syncWithServer]);

	// Save to localStorage
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("deelzo_cart", JSON.stringify(cart));
		}
	}, [cart, isInitialized]);

	const addToCart = async (item: CartItem) => {
		const existingItem = cart.find((i) => i._id === item._id);
		if (existingItem) {
			toast.info("Item is already in your cart");
			return;
		}

		const newCart = [...cart, item];
		setCart(newCart);
		toast.success(`${item.title} added to cart!`);

		if (user) {
			try {
				await cartService.updateCart(user._id, { items: newCart });
			} catch (error) {
				console.error("Server add error:", error);
			}
		}
	};

	const removeFromCart = async (productId: string) => {
		const newCart = cart.filter((item) => item._id !== productId);
		setCart(newCart);
		toast.success("Item removed from cart");

		if (user) {
			try {
				await cartService.updateCart(user._id, { items: newCart });
			} catch (error) {
				console.error("Server remove error:", error);
			}
		}
	};

	const clearCart = async () => {
		setCart([]);
		if (user) {
			try {
				await cartService.clearCart(user._id);
			} catch (error) {
				console.error("Server clear error:", error);
			}
		}
	};

	const isInCart = (productId: string) => {
		return cart.some((item) => item._id === productId);
	};

	const getCartTotal = () => {
		return cart.reduce((total, item) => total + item.price, 0);
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				removeFromCart,
				clearCart,
				isInCart,
				getCartTotal,
				itemCount: cart.length,
				loading
			}}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
