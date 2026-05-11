import { db } from "@/lib/firebase";
import { userService } from "./userService";
import { 
    ref, 
    set, 
    get, 
    push,
    update, 
    remove, 
    query, 
    orderByChild, 
    equalTo 
} from "firebase/database";

export const blogService = {
    async getBlogs() {
        const blogsRef = ref(db, 'blogs');
        const snapshot = await get(blogsRef);
        if (!snapshot.exists()) return [];
        
        const blogs = [];
        snapshot.forEach((child) => {
            blogs.push({ _id: child.key, ...child.val() });
        });
        
        // Populate Author Info
        try {
            const allUsers = await userService.getUsers();
            const userMap = {};
            allUsers.forEach(u => userMap[u._id] = u);

            blogs.forEach(blog => {
                const authorId = blog.author || blog.userId;
                if (authorId && typeof authorId === 'string' && userMap[authorId]) {
                    blog.author = userMap[authorId];
                }
            });
        } catch (error) {
            console.error("Failed to populate author info:", error);
        }

        return blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async getBlog(idOrSlug) {
        const blogsRef = ref(db, 'blogs');
        
        // Try by ID
        const blogRef = ref(db, `blogs/${idOrSlug}`);
        const snapshot = await get(blogRef);
        if (snapshot.exists()) {
            const blog = { _id: idOrSlug, ...snapshot.val() };
            // Populate Author Info
            const authorId = blog.author || blog.userId;
            if (authorId && typeof authorId === 'string') {
                const authorData = await userService.getUser(authorId);
                if (authorData) blog.author = authorData;
            }
            return blog;
        }

        // Try by Slug
        const slugQuery = query(blogsRef, orderByChild('slug'), equalTo(idOrSlug));
        const slugSnapshot = await get(slugQuery);
        if (slugSnapshot.exists()) {
            const blogs = slugSnapshot.val();
            const id = Object.keys(blogs)[0];
            const blog = { _id: id, ...blogs[id] };

            // Populate Author Info
            const authorId = blog.author || blog.userId;
            if (authorId && typeof authorId === 'string') {
                const authorData = await userService.getUser(authorId);
                if (authorData) blog.author = authorData;
            }
            return blog;
        }

        return null;
    },

    async createBlog(data) {
        const blogsRef = ref(db, 'blogs');
        const newBlogRef = push(blogsRef);
        const blogData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            status: data.status || 'draft'
        };
        await set(newBlogRef, blogData);
        return { _id: newBlogRef.key, ...blogData };
    },

    async updateBlog(id, data) {
        const blogRef = ref(db, `blogs/${id}`);
        const updates = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        await update(blogRef, updates);
        return { _id: id, ...updates };
    },

    async deleteBlog(id) {
        const blogRef = ref(db, `blogs/${id}`);
        await remove(blogRef);
        return true;
    }
};
