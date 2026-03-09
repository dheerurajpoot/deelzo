import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getCouponByIdOrCode, updateCoupon, deleteCoupon } from "@/lib/db/coupons";
import { getUserById } from "@/lib/db/users";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const coupon = await getCouponByIdOrCode(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      coupon
    });
    
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getDataFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const couponParams = await getCouponByIdOrCode(id);
    
    if (!couponParams) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    
    const updateData = {};
    if (body.code) updateData.code = body.code.toUpperCase();
    if (body.discountType) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue;
    if (body.minimumAmount !== undefined) updateData.minimumAmount = body.minimumAmount;
    if (body.maximumDiscount !== undefined) updateData.maximumDiscount = body.maximumDiscount;
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.validUntil) updateData.validUntil = new Date(body.validUntil);
    if (body.applicableCategories) updateData.applicableCategories = body.applicableCategories;
    if (body.applicableProducts) updateData.applicableProducts = body.applicableProducts;
    
    const updatedCoupon = await updateCoupon(couponParams._id, updateData);
    
    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon
    });
    
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getDataFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const user = await getUserById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const couponParams = await getCouponByIdOrCode(id);
    
    if (!couponParams) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    await deleteCoupon(couponParams._id);
    
    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}