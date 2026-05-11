"use server";

import { 
    sendEmail, 
    generateNewListingNotification, 
    generateListingStatusUpdate,
    generateOrderConfirmationEmail,
    generateAdminOrderNotification
} from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

export async function sendNewListingEmail(listingData) {
    try {
        const listingLink = `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listingData._id}`;
        const html = generateNewListingNotification(
            listingData.title,
            listingData.sellerName || "A Seller",
            listingLink
        );

        await sendEmail({
            to: EMAIL,
            subject: `🚀 New Listing Pending Approval: ${listingData.title}`,
            html
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send new listing email:", error);
        return { success: false, error: error.message };
    }
}

export async function sendListingStatusEmail(listingData, status, adminNote = "") {
    try {
        const html = generateListingStatusUpdate(
            listingData.title,
            status,
            adminNote
        );

        await sendEmail({
            to: listingData.sellerEmail,
            subject: `📋 Listing Update: ${listingData.title} is now ${status}`,
            html
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send listing status email:", error);
        return { success: false, error: error.message };
    }
}

export async function sendOrderEmails(orderData) {
    try {
        // 1. Send to Customer
        const customerHtml = generateOrderConfirmationEmail(orderData);
        const customerEmailPromise = sendEmail({
            to: orderData.userEmail,
            subject: `🛍️ Order Confirmed! #${orderData.orderId}`,
            html: customerHtml
        });

        // 2. Send to Admin
        const adminHtml = generateAdminOrderNotification(orderData);
        const adminEmailPromise = sendEmail({
            to: EMAIL,
            subject: `💰 New Order Received: #${orderData.orderId} ($${orderData.finalAmount})`,
            html: adminHtml
        });

        await Promise.all([customerEmailPromise, adminEmailPromise]);

        return { success: true };
    } catch (error) {
        console.error("Failed to send order emails:", error);
        return { success: false, error: error.message };
    }
}
