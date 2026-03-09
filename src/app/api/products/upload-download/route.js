import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataFromToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

// POST /api/products/upload-download - Upload download file for a product
export async function POST(request) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		const data = await request.formData();
		const file = data.get("file");
		const productId = data.get("productId");
		
		if (!file) {
			return NextResponse.json(
				{ success: false, message: "No file uploaded" },
				{ status: 400 }
			);
		}
		
		if (!productId) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}
		
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		
		// Create unique filename
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.name);
		// Sanitize filename
		const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
		const filename = safeName.replace(ext, "") + "-" + uniqueSuffix + ext;
		
		// Save to public/downloads
		const uploadDir = path.join(process.cwd(), "public/downloads");
		
		// Ensure directory exists
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		
		const filepath = path.join(uploadDir, filename);
		
		await writeFile(filepath, buffer);
		
		const url = `/downloads/${filename}`;
		const fileSize = buffer.length;
		
		return NextResponse.json({
			success: true,
			file: {
				name: file.name,
				url: url,
				size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
				type: file.type
			}
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ success: false, message: "Upload failed" },
			{ status: 500 }
		);
	}
}