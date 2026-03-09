import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import User from "../../../../models/User";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const coupon = await Coupon.findById(params.id);
    
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
    // Check if user is admin
    const userId = await getDataFromToken(request);
    const user = await User.findById(userId).exec();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minimumAmount, 
      maximumDiscount, 
      usageLimit, 
      isActive, 
      validUntil, 
      applicableCategories, 
      applicableProducts 
    } = body;
    
    const coupon = await Coupon.findById(params.id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    
    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumAmount !== undefined) coupon.minimumAmount = minimumAmount;
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (applicableCategories) coupon.applicableCategories = applicableCategories;
    if (applicableProducts) coupon.applicableProducts = applicableProducts;
    
    await coupon.save();
    
    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon
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
    // Check if user is admin
    const userId = await getDataFromToken(request);
    const user = await User.findById(userId).exec();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const coupon = await Coupon.findByIdAndDelete(params.id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    
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