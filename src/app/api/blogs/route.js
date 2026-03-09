import { db } from "@/lib/firebase/admin";
import { getUserById } from "@/lib/db/users";
import { getPlanByName } from "@/lib/db/plans";
import { createBlog } from "@/lib/db/blogs";
import { getDataFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const userId = searchParams.get("userId");
		const category = searchParams.get("category");
		const search = searchParams.get("search");
		const limit = parseInt(searchParams.get("limit")) || 10;
		const page = parseInt(searchParams.get("page")) || 1;
		const skip = (page - 1) * limit;

		let blogsRef = db.collection("blogs");
		if (status) blogsRef = blogsRef.where("status", "==", status);
		if (userId) blogsRef = blogsRef.where("author", "==", userId);
		if (category && category !== "All") blogsRef = blogsRef.where("category", "==", category);
		
		const snapshot = await blogsRef.get();
		let allBlogs = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		allBlogs.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		// Handle regex search in-memory since Firestore doesn't support it natively
		if (search) {
			const lowerSearch = search.toLowerCase();
			allBlogs = allBlogs.filter(blog => 
				(blog.title && blog.title.toLowerCase().includes(lowerSearch)) ||
				(blog.content && blog.content.toLowerCase().includes(lowerSearch))
			);
		}

		const total = allBlogs.length;
		const paginatedBlogs = allBlogs.slice(skip, skip + limit);

		// Populate author
		const rawAuthorIds = [...new Set(paginatedBlogs.map(b => b.author))];
		const authorIds = rawAuthorIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (authorIds.length > 0) {
			const usersMap = {};
			for (let i = 0; i < authorIds.length; i += 10) {
				const batch = authorIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, avatar: data.avatar };
					});
				}
			}

			for (let i = 0; i < paginatedBlogs.length; i++) {
				const authorId = paginatedBlogs[i].author;
				paginatedBlogs[i].author = usersMap[authorId] || { _id: authorId, name: "Unknown" };
			}
		}

		return NextResponse.json({
			success: true,
			blogs: paginatedBlogs,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		const body = await request.json();

		if (user.role === "admin") {
			if (body.slug) {
				const snapshot = await db.collection("blogs").where("slug", "==", body.slug).limit(1).get();
				if (!snapshot.empty) {
					return NextResponse.json(
						{
							success: false,
							message: "A blog with this slug already exists. Please choose a different slug.",
						},
						{ status: 400 }
					);
				}
			}

			const newBlog = await createBlog({
				...body,
				author: userId,
				status: "published",
			});
			return NextResponse.json({ success: true, blog: newBlog });
		}

		const requestedStatus = body.status === "draft" ? "draft" : "pending";

		if (requestedStatus === "draft") {
			if (body.slug) {
				const snapshot = await db.collection("blogs").where("slug", "==", body.slug).limit(1).get();
				if (!snapshot.empty) {
					return NextResponse.json(
						{
							success: false,
							message: "A blog with this slug already exists. Please choose a different slug.",
						},
						{ status: 400 }
					);
				}
			}

			const newBlog = await createBlog({
				...body,
				author: userId,
				status: "draft",
			});
			return NextResponse.json({ success: true, blog: newBlog });
		}

		const plan = await getPlanByName(user.currentPlan);

		if (!plan) {
			return NextResponse.json(
				{ success: false, message: "Plan configuration not found." },
				{ status: 400 }
			);
		}

		const now = new Date();
		let canPost = false;

		const userLastPostDate = user.lastPostDate?.toDate ? user.lastPostDate.toDate() : (user.lastPostDate ? new Date(user.lastPostDate) : null);
		const userPeriodStartDate = user.periodStartDate?.toDate ? user.periodStartDate.toDate() : (user.periodStartDate ? new Date(user.periodStartDate) : null);

		if (plan.frequency === "daily") {
			if (!userLastPostDate || userLastPostDate.toDateString() !== now.toDateString()) {
				canPost = true;
			}
		} else {
			const oneWeek = 7 * 24 * 60 * 60 * 1000;
			if (!userPeriodStartDate || now - userPeriodStartDate > oneWeek) {
				user.postCount = 0;
				user.periodStartDate = now;
			}

			if (user.postCount < plan.postLimit) {
				canPost = true;
			}
		}

		if (!canPost) {
			return NextResponse.json(
				{
					success: false,
					message: `You have reached your limit for the ${user.currentPlan} plan.`,
				},
				{ status: 403 }
			);
		}

		if (body.slug) {
			const snapshot = await db.collection("blogs").where("slug", "==", body.slug).limit(1).get();
			if (!snapshot.empty) {
				return NextResponse.json(
					{
						success: false,
						message: "A blog with this slug already exists. Please choose a different slug.",
					},
					{ status: 400 }
				);
			}
		}

		const newBlog = await createBlog({
			...body,
			author: userId,
			status: "pending",
		});

		try {
			await sendEmail({
				to: EMAIL,
				subject: `New Blog for Review`,
				html: "<p>There is a new blog post for review.</p><p>Blog ID: " + newBlog._id + "</p><p>Blog Title: " + newBlog.title + "</p><p>Author: " + user.name + "</p>",
			});
		} catch (emailError) {
			console.error("Failed to send admin blog email", emailError);
		}

		const updates = {
			lastPostDate: now,
			postCount: plan.frequency !== "daily" ? (user.postCount + 1) : user.postCount,
			periodStartDate: user.periodStartDate || now
		};

		await db.collection("users").doc(userId).update(updates);

		return NextResponse.json({ success: true, blog: newBlog });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
