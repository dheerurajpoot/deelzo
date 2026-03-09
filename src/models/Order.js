import mongoose from "mongoose";
import "./Product"
import "./User"

const orderSchema = new mongoose.Schema(
	{
		// Order Identification
		orderId: {
			type: String,
			unique: true,
			sparse: true,
		},
		
		// User who placed the order
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		
		// Product being purchased
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		
		// Product details at time of purchase (snapshot)
		productSnapshot: {
			title: String,
			price: Number,
			comparePrice: Number,
			currency: String,
			category: String,
			thumbnail: String,
		},
		
		// Pricing
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: "INR",
		},
		discountApplied: {
			type: Number,
			default: 0,
		},
		finalAmount: {
			type: Number,
			required: true,
		},
		
		// Payment Details
		razorpay: {
			orderId: {
				type: String,
			},
			paymentId: {
				type: String,
			},
			signature: {
				type: String,
			},
		},
		
		// Transaction ID for manual payment verification
		transactionId: {
			type: String,
		},
		
		paymentMethod: {
			type: String,
			enum: ["upi", "binance", "card"],
		},
		
		// Payment Status
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded", "cancelled", "processing"],
			default: "processing",
		},
		
		// Order Status
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "cancelled", "refunded", "failed"],
			default: "processing",
		},
		
		// Delivery/Download Status
		deliveryStatus: {
			type: String,
			enum: ["pending", "delivered", "failed", "processing"],
			default: "pending",
		},
		couponCode: {
			type: String,
		},
		
		// Download URL for digital products (encrypted or signed)
		downloadUrl: {
			type: String,
		},
		
		// Download expiry
		downloadExpiry: {
			type: Date,
		},
		
		// Number of downloads
		downloadCount: {
			type: Number,
			default: 0,
		},
		
		// Notes
		notes: {
			type: String,
		},
		
		// Admin notes
		adminNotes: {
			type: String,
		},
		
		// Timestamps for tracking
		paidAt: {
			type: Date,
		},
		
		deliveredAt: {
			type: Date,
		},
		
		refundedAt: {
			type: Date,
		},
		
		// Refund details
		refundDetails: {
			amount: Number,
			reason: String,
			processedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		},
	},
	{
		timestamps: true,
	}
);

// Generate unique order ID before validation
orderSchema.pre("validate", function (next) {
	if (!this.orderId) {
		const timestamp = Date.now().toString(36).toUpperCase();
		const random = Math.random().toString(36).substring(2, 6).toUpperCase();
		this.orderId = `ORD-${timestamp}-${random}`;
	}
	next();
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ product: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
