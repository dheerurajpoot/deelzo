import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, cartTotal, productCategory, productId } = body;
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }
    
    const snapshot = await db.collection("coupons")
      .where("code", "==", code.toUpperCase())
      .where("isActive", "==", true)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    const coupon = snapshot.docs[0].data();
    const now = new Date();
    const validFrom = coupon.validFrom?.toDate ? coupon.validFrom.toDate() : new Date(coupon.validFrom || 0);
    const validUntil = coupon.validUntil?.toDate ? coupon.validUntil.toDate() : new Date(coupon.validUntil || Date.now() + 10000000);

    if (now < validFrom || now > validUntil) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }
    
    // Check minimum amount
    if (cartTotal < (coupon.minimumAmount || 0)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Minimum order amount is ${coupon.minimumAmount}` 
        },
        { status: 400 }
      );
    }
    
    // Check category restrictions
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && productCategory) {
      if (!coupon.applicableCategories.includes(productCategory)) {
        return NextResponse.json(
          { success: false, message: "Coupon not valid for this category" },
          { status: 400 }
        );
      }
    }
    
    // Check product restrictions
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0 && productId) {
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