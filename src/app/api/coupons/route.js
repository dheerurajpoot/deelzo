import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { createCoupon } from "@/lib/db/coupons";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    let couponsRef = db.collection("coupons").orderBy("createdAt", "desc");
    
    const snapshot = await couponsRef.get();
    let allCoupons = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      allCoupons = allCoupons.filter(c => c.code && c.code.toLowerCase().includes(lowerSearch));
    }

    const total = allCoupons.length;
    const skip = (page - 1) * limit;
    const paginatedCoupons = allCoupons.slice(skip, skip + limit);
    
    return NextResponse.json({
      success: true,
      coupons: paginatedCoupons,
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
    const user = await getUserById(userId);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
    
    if (!code || !discountType || !discountValue || !validUntil) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const existingSnapshot = await db.collection("coupons").where("code", "==", code.toUpperCase()).limit(1).get();
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }
    
    const newCoupon = await createCoupon({
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