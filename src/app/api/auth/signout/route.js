import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const revalidate = 0;
export async function GET() {
	try {
		await connectDB();
		const response = new NextResponse();
		response.cookies.set("token", "", {
			httpOnly: true,
			expires: new Date(0),
			path: "/",
		});
		response.cookies.set("userRole", "", {
			httpOnly: true,
			path: "/",
		});

		return response;
	} catch (error) {
		if (error instanceof Error) {
			console.log(error);
			return NextResponse.json(
				{ message: error.message },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
