"use server";

import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function getDownloadUrl(productId, userId) {
    try {
        if (!userId) return { success: false, message: "Unauthorized" };

        // 1. Verify Ownership
        const orders = await orderService.getUserOrders(userId);
        const hasPurchased = orders.some(order => 
            (order.status === 'completed' || order.paymentStatus === 'completed') && 
            order.items?.some(item => item.productId === productId)
        );

        if (!hasPurchased) {
            return { success: false, message: "Access Denied: Product not purchased" };
        }

        // 2. Get Product details
        const product = await productService.getProduct(productId);
        if (!product || !product.downloadOptions) {
            return { success: false, message: "Download not available" };
        }

        const options = product.downloadOptions;
        let downloadUrl = null;

        if (options.type === "upload" && options.file?.url) {
            downloadUrl = options.file.url;
        } else if (options.type === "link" && options.link) {
            downloadUrl = options.link;
        }

        if (!downloadUrl) {
            return { success: false, message: "Download link missing" };
        }

        return { success: true, downloadUrl };
    } catch (error) {
        console.error("Download error:", error);
        return { success: false, message: "Server error" };
    }
}
