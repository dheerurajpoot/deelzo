import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minimumAmount: {
    type: Number,
    default: 0
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  applicableCategories: {
    type: [String],
    default: []
  },
  applicableProducts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Pre-save middleware to update timestamps
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;