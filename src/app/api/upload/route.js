import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request) {
	try {
		const data = await request.formData();
		const file = data.get("file");

		if (!file) {
			return NextResponse.json(
				{ success: false, message: "No file uploaded" },
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

		// Save to public/uploads
		const uploadDir = path.join(process.cwd(), "public/uploads");

		// Ensure directory exists
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const filepath = path.join(uploadDir, filename);

		await writeFile(filepath, buffer);

		const url = `/uploads/${filename}`;

		return NextResponse.json({ success: true, url });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ success: false, message: "Upload failed" },
			{ status: 500 }
		);
	}
}
