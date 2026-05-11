import { NextResponse } from "next/server";
import crypto from "crypto";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { sendOrderEmails } from "@/app/actions/emailActions";
import { db } from "@/lib/firebaseAdmin";

export async function POST(request) {
	try {
		const formData = await request.formData();
		const status = formData.get("status");
		const txnid = formData.get("txnid");
		const amount = formData.get("amount");
		const productinfo = formData.get("productinfo");
		const firstname = formData.get("firstname");
		const email = formData.get("email");
		const hash = formData.get("hash");
		const key = formData.get("key");
		const additionalCharges = formData.get("additionalCharges") || "";

		const udf1 = formData.get("udf1") || "";
		const udf2 = formData.get("udf2") || "";
		const udf3 = formData.get("udf3") || "";
		const udf4 = formData.get("udf4") || "";
		const udf5 = formData.get("udf5") || "";
		const udf6 = formData.get("udf6") || "";
		const udf7 = formData.get("udf7") || "";
		const udf8 = formData.get("udf8") || "";
		const udf9 = formData.get("udf9") || "";
		const udf10 = formData.get("udf10") || "";

		const salt = process.env.PAYU_MERCHANT_SALT;
		if (!salt) return NextResponse.redirect(new URL("/shop/cart?payment=error", request.url));

		// STRICT REVERSE HASH (17 Pipes)
		// salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
		let reverseHashString = "";
		if (additionalCharges) {
			reverseHashString = `${additionalCharges}|${salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
		} else {
			reverseHashString = `${salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
		}

		const calculatedHash = crypto.createHash("sha512").update(reverseHashString).digest("hex");

		if (calculatedHash !== hash) {
			console.error("Hash Mismatch:", { txnid, calc: calculatedHash, received: hash });
			return NextResponse.redirect(new URL("/shop/cart?payment=failed&reason=security", request.url));
		}

		const order = await orderService.getOrder(udf1);

		if (!order) return NextResponse.redirect(new URL("/shop/cart?payment=failed&reason=not_found", request.url));

		if (status === "success") {
            const updates = {
                paymentStatus: "completed",
                status: "completed",
                deliveryStatus: "delivered",
                paidAt: new Date().toISOString()
            };
			await orderService.updateOrder(order._id, updates);

			if (order.items?.length > 0) {
				for (const item of order.items) {
                    if (item.productId) {
                        await productService.updateProduct(item.productId, { salesCount: (item.snapshot?.salesCount || 0) + 1 });
                    }
                }
			}

            // Send confirmation emails
            try {
                const userRef = db.ref(`users/${order.user}`);
                const userSnap = await userRef.once('value');
                const userData = userSnap.val();

                await sendOrderEmails({
                    ...order,
                    userName: userData?.name || "Customer",
                    userEmail: userData?.email || order.email || "No Email",
                    items: order.items?.map((item) => ({
                        title: item.snapshot?.title || "Product",
                        price: item.snapshot?.price || 0,
                        quantity: item.quantity || 1
                    }))
                });
            } catch (emailError) {
                console.error("Failed to send PayU order emails:", emailError);
            }

			return NextResponse.redirect(new URL("/dashboard/orders?payment=success", request.url), { status: 303 });
		} else {
			await orderService.updateOrder(order._id, { paymentStatus: "failed", status: "failed" });
			return NextResponse.redirect(new URL("/shop/cart?payment=failed", request.url), { status: 303 });
		}
	} catch (error) {
		return NextResponse.redirect(new URL("/shop/cart?payment=failed", request.url), { status: 303 });
	}
}
