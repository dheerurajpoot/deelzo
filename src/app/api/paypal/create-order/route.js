import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getDataFromToken } from "@/lib/auth";

export async function POST(request) {
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { cart } = await request.json();
        
        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid cart data" }, { status: 400 });
        }

        // 1. Calculate original item total
        const itemsTotal = cart.items.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);
        
        // 2. The total amount passed from frontend is the DISCOUNTED amount (baseAmount)
        const baseAmount = parseFloat(cart.totalAmount); 
        
        // 3. Calculate discount relative to original items
        const discountAmount = Math.max(0, itemsTotal - baseAmount);

        // 4. Calculate PayPal fee on the DISCOUNTED base amount
        const paypalFee = parseFloat((baseAmount * 0.07).toFixed(2));

        const paypalCart = {
            ...cart,
            discount: discountAmount,
            items: [
                ...cart.items,
                {
                    title: "PayPal Processing Fee (7%)",
                    price: paypalFee,
                    quantity: 1,
                    productId: "fee-001"
                }
            ]
        };

        const order = await createPayPalOrder(paypalCart);

        return NextResponse.json({
            success: true,
            orderID: order.id,
        });
    } catch (error) {
        console.error("PayPal Create Order CRITICAL Error:", {
            message: error.message,
            stack: error.stack,
            data: error.response?.data
        });
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to create PayPal order" 
        }, { status: 500 });
    }
}
