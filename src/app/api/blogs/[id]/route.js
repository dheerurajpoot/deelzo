import { db } from "@/lib/firebase/admin";
import { getBlogByIdOrSlug, updateBlog, deleteBlog, incrementBlogViews } from "@/lib/db/blogs";
import { getUserById } from "@/lib/db/users";
import { getDataFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { extractParamFromRequest } from "@/lib/utils";

export async function GET(request) {
	try {
		const id = extractParamFromRequest(request);
		let blog = await getBlogByIdOrSlug(id);

		if (!blog) {
			return NextResponse.json(
				{ success: false, message: "Blog not found" },
				{ status: 404 }
			);
		}

		// Increment views
		await incrementBlogViews(blog._id);

		if (blog.author) {
			const author = await getUserById(blog.author);
			if (author) {
				blog.author = { _id: author._id, name: author.name, avatar: author.avatar };
			}
		}

		return NextResponse.json({ success: true, blog });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		const id = extractParamFromRequest(request);
		const body = await request.json();

		const blog = await getBlogByIdOrSlug(id);
		if (!blog) {
			return NextResponse.json(
				{ success: false, message: "Blog not found" },
				{ status: 404 }
			);
		}

		if (blog.author !== userId && user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Forbidden" },
				{ status: 403 }
			);
		}

		if (user.role !== "admin") {
			if (body.status !== "draft") {
				body.status = "pending";
			}
		}

		if (body.slug) {
			const snapshot = await db.collection("blogs").where("slug", "==", body.slug).get();
			let conflict = false;
			snapshot.forEach(doc => {
				if (doc.id !== blog._id) conflict = true;
			});
			if (conflict) {
				return NextResponse.json(
					{
						success: false,
						message: "A blog with this slug already exists. Please choose a different slug.",
					},
					{ status: 400 }
				);
			}
		}

		const updatedBlog = await updateBlog(blog._id, body);
		return NextResponse.json({ success: true, blog: updatedBlog });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		const id = extractParamFromRequest(request);

		const blog = await getBlogByIdOrSlug(id);
		if (!blog) {
			return NextResponse.json(
				{ success: false, message: "Blog not found" },
				{ status: 404 }
			);
		}

		if (blog.author !== userId && user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Forbidden" },
				{ status: 403 }
			);
		}

		await deleteBlog(blog._id);
		return NextResponse.json({ success: true, message: "Blog deleted" });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
