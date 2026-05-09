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
    limitToLast,
    startAt,
    endAt,
    equalTo 
} from "firebase/database";

export const productService = {
    // Get all products with filters (In-memory filtering for complex queries)
    async getProducts(filters = {}) {
        const productsRef = ref(db, 'products');
        let productsQuery = query(productsRef);
        
        const snapshot = await get(productsQuery);
        if (!snapshot.exists()) return { products: [], total: 0 };

        let products = [];
        snapshot.forEach((childSnapshot) => {
            products.push({ _id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Apply filters in-memory (Simple and effective for RTDB)
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        if (filters.status) {
            products = products.filter(p => p.status === filters.status);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter(p => 
                p.title?.toLowerCase().includes(searchLower) || 
                p.description?.toLowerCase().includes(searchLower)
            );
        }
        if (filters.minPrice) {
            products = products.filter(p => p.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
        }
        if (filters.featured === "true") {
            products = products.filter(p => p.isFeatured === true);
        }

        // Sorting
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        products.sort((a, b) => {
            if (sortOrder === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });

        const total = products.length;
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 12;
        const skip = (page - 1) * limit;
        
        return {
            products: products.slice(skip, skip + limit),
            total,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    },

    // Get product by ID or Slug
    async getProduct(idOrSlug) {
        const productsRef = ref(db, 'products');
        
        // Try by ID first
        const productRef = ref(db, `products/${idOrSlug}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) return { _id: idOrSlug, ...snapshot.val() };

        // Try by Slug
        const slugQuery = query(productsRef, orderByChild('slug'), equalTo(idOrSlug));
        const slugSnapshot = await get(slugQuery);
        if (slugSnapshot.exists()) {
            const products = slugSnapshot.val();
            const id = Object.keys(products)[0];
            return { _id: id, ...products[id] };
        }

        return null;
    },

    // Create product
    async createProduct(data) {
        const productsRef = ref(db, 'products');
        const newProductRef = push(productsRef);
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        const productData = {
            ...data,
            slug,
            createdAt: new Date().toISOString(),
            status: data.status || 'draft',
            salesCount: 0,
            views: 0
        };
        
        await set(newProductRef, productData);
        return { _id: newProductRef.key, ...productData };
    },

    // Update product
    async updateProduct(productId, data) {
        const productRef = ref(db, `products/${productId}`);
        await update(productRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    // Increment views
    async incrementViews(productId) {
        const productRef = ref(db, `products/${productId}/views`);
        const snapshot = await get(productRef);
        const currentViews = snapshot.val() || 0;
        await set(productRef, currentViews + 1);
    },

    // Delete product
    async deleteProduct(productId) {
        const productRef = ref(db, `products/${productId}`);
        await remove(productRef);
    }
};
