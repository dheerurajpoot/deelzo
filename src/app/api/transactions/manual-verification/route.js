import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/auth";
import User from "@/models/User";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

export async function POST(request) {
  try {
    // Get user from token
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const { productId, transactionId, paymentMethod, amount, currency } = await request.json();

    // Validate required fields
    if (!productId || !transactionId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if transaction ID already exists
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction) {
      return NextResponse.json(
        { success: false, message: "Transaction ID already exists" },
        { status: 400 }
      );
    }

    // Create transaction
    const newTransaction = new Transaction({
      userId: user._id,
      productId: product._id,
      transactionId,
      paymentMethod,
      amount: amount || product.price,
      currency: currency || product.currency,
      status: "pending", // Manual verification required
    });

    await newTransaction.save();

    // Send notification to admin for manual verification
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
          <p><strong>Amount:</strong> ${amount} ${currency}</p>
          <p><strong>Status:</strong> Pending</p>
          <p>Please verify this transaction and update its status in the admin panel.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Continue processing even if email fails
    }

    // Send confirmation to user
    try {
      await sendEmail({
        to: user.email,
        subject: "Transaction Submitted for Verification",
        html: `
          <h2>Transaction Submitted Successfully</h2>
          <p>Thank you for your order! Your transaction has been submitted for verification.</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Amount:</strong> ${amount} ${currency}</p>
          <p>Our team will verify your transaction and approve it shortly. You will receive another email once your order is approved.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError);
      // Continue processing even if email fails
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