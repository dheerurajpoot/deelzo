import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { getProductByIdOrSlug } from "@/lib/db/products";
import { createTransaction } from "@/lib/db/transactions";
import { db } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

export async function POST(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { productId, transactionId, paymentMethod, amount, currency } = await request.json();

    if (!productId || !transactionId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await getProductByIdOrSlug(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const existingSnapshot = await db.collection("transactions").where("transactionId", "==", transactionId).limit(1).get();
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Transaction ID already exists" },
        { status: 400 }
      );
    }

    const newTransaction = await createTransaction({
      user: user._id,
      productId: product._id,
      transactionId,
      paymentMethod,
      amount: amount || product.price,
      currency: currency || product.currency,
      status: "pending",
    });

    try {
      await sendEmail({
        to: EMAIL,
        subject: "New Transaction Pending Verification",
        html: `
          <h2>New Transaction Pending Verification</h2>
          <p><strong>User:</strong> ${user.name} (${user.email})</p>
          <p><strong>Product:</strong> ${product.title}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Amount:</strong> ${amount || product.price} ${currency || product.currency || 'INR'}</p>
          <p><strong>Status:</strong> Pending</p>
          <p>Please verify this transaction and update its status in the admin panel.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    try {
      await sendEmail({
        to: user.email,
        subject: "Transaction Submitted for Verification",
        html: `
          <h2>Transaction Submitted Successfully</h2>
          <p>Thank you for your order! Your transaction has been submitted for verification.</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Amount:</strong> ${amount || product.price} ${currency || product.currency || 'INR'}</p>
          <p>Our team will verify your transaction and approve it shortly. You will receive another email once your order is approved.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Transaction submitted successfully for verification",
      transactionId: newTransaction._id,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}