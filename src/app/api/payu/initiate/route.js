import { NextResponse } from "next/server";
import crypto from "crypto";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";

export async function POST(request) {
	try {
		const body = await request.json();
		const {
			amount: rawAmount,
			productinfo: rawProductInfo,
			firstname: rawFirstName,
			email,
			phone,
			userId,
			items,
			couponCode,
			discountApplied,
			finalAmount,
		} = body;

		// 1. Clean Inputs (Essential for PayU Hash integrity)
		const amount = parseFloat(rawAmount).toFixed(2);
		const productinfo = (rawProductInfo || "Order").replace(/[^a-zA-Z0-9]/g, "").substring(0, 50);
		const firstname = (rawFirstName || "Customer").split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
		const txnid = `T${Date.now()}${Math.floor(Math.random() * 999)}`.substring(0, 20);

		// 2. Resolve Items for Snapshot
		const orderItems = [];
		for (const item of items) {
            const product = await productService.getProduct(item.productId);
            orderItems.push({
				productId: item.productId,
				quantity: item.quantity || 1,
				snapshot: {
					title: product?.title || "Item",
					price: product?.price || 0,
					currency: product?.currency || "USD",
					thumbnail: product?.thumbnail || "",
					category: product?.category || "Digital",
				}
			});
        }

		// 3. Create Pending Order
        const orderData = {
			user: userId,
			items: orderItems,
			amount: orderItems.reduce((acc, item) => acc + (item.snapshot.price * item.quantity), 0),
			finalAmount: finalAmount,
			currency: "USD",
			discountApplied: discountApplied || 0,
			couponCode: couponCode || null,
			paymentMethod: "payu",
			paymentStatus: "pending",
			status: "pending",
			transactionId: txnid,
		};

		const newOrder = await orderService.createOrder(orderData);

		const key = process.env.PAYU_MERCHANT_KEY;
		const salt = process.env.PAYU_MERCHANT_SALT;

		if (!key || !salt) {
			return NextResponse.json({ success: false, message: "Server Configuration Error" }, { status: 500 });
		}

		// 4. Standard Professional Hash (16 Pipes)
		// Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
		// We only use udf1 (Internal ID) and udf2 (User ID) for simplicity
		const udf1 = newOrder._id.toString();
		const udf2 = userId || "";
		const udf3 = ""; const udf4 = ""; const udf5 = ""; 
		const udf6 = ""; const udf7 = ""; const udf8 = ""; const udf9 = ""; const udf10 = "";

		const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;
		const hash = crypto.createHash("sha512").update(hashString).digest("hex");

		return NextResponse.json({
			success: true,
			hash,
			txnid,
			key,
			amount,
			productinfo,
			firstname,
			email,
			phone: phone || "9999999999",
			udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
		});
	} catch (error) {
		console.error("Initiate Error:", error);
		return NextResponse.json({ success: false, message: "Payment Initiation Failed" }, { status: 500 });
	}
}