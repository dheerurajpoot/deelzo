import { db } from "@/lib/firebase";
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
        
        return blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async getBlog(idOrSlug) {
        const blogsRef = ref(db, 'blogs');
        
        // Try by ID
        const blogRef = ref(db, `blogs/${idOrSlug}`);
        const snapshot = await get(blogRef);
        if (snapshot.exists()) return { _id: idOrSlug, ...snapshot.val() };

        // Try by Slug
        const slugQuery = query(blogsRef, orderByChild('slug'), equalTo(idOrSlug));
        const slugSnapshot = await get(slugQuery);
        if (slugSnapshot.exists()) {
            const blogs = slugSnapshot.val();
            const id = Object.keys(blogs)[0];
            return { _id: id, ...blogs[id] };
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
