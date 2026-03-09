import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { getDataFromToken } from "../../../lib/auth";
import User from "../../../models/User";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Coupon.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCoupons: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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
      validUntil, 
      applicableCategories, 
      applicableProducts 
    } = body;
    
    // Validate required fields
    if (!code || !discountType || !discountValue || !validUntil) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }
    
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumAmount: minimumAmount || 0,
      maximumDiscount: maximumDiscount || null,
      usageLimit: usageLimit || null,
      validUntil: new Date(validUntil),
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || []
    });
    
    await newCoupon.save();
    
    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon
    });
    
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}