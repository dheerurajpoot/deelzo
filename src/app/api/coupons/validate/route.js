import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code, cartTotal, productCategory, productId } = body;
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }
    
    // Check minimum amount
    if (cartTotal < coupon.minimumAmount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Minimum order amount is ${coupon.minimumAmount}` 
        },
        { status: 400 }
      );
    }
    
    // Check category restrictions
    if (coupon.applicableCategories.length > 0 && productCategory) {
      if (!coupon.applicableCategories.includes(productCategory)) {
        return NextResponse.json(
          { success: false, message: "Coupon not valid for this category" },
          { status: 400 }
        );
      }
    }
    
    // Check product restrictions
    if (coupon.applicableProducts.length > 0 && productId) {
      if (!coupon.applicableProducts.includes(productId)) {
        return NextResponse.json(
          { success: false, message: "Coupon not valid for this product" },
          { status: 400 }
        );
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }
    
    const finalAmount = cartTotal - discountAmount;
    
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        minimumAmount: coupon.minimumAmount,
        maximumDiscount: coupon.maximumDiscount
      }
    });
    
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}